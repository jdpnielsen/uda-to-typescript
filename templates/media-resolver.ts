import { buildDeliveryApiUrl } from './delivery-api';

/**
 * Controls behavior when a referenced media item cannot be resolved.
 */
export type MissingMediaMode = 'warn-and-keep' | 'throw';

/**
 * Fetch function contract used by generated fetchers and resolvers.
 */
export type FetchFunctionLike<O = RequestInit> = <T>({ url, options }: { url: URL, options?: O }) => Promise<T>;

/**
 * Runtime options for media reference hydration.
 */
export type MediaResolverOptions<O = RequestInit> = {
	host: string;
	fetchFunction: FetchFunctionLike<O>;
	fetchOptions?: O;
	enabled?: boolean;
	batchSize?: number;
	onMissingMedia?: MissingMediaMode;
}

type MediaReference = {
	mediaKey: string;
	crops?: unknown[];
	focalPoint?: unknown;
	[key: string]: unknown;
}

type MediaItem = {
	id: string;
	crops?: unknown[];
	focalPoint?: unknown;
	[key: string]: unknown;
}

type FetchMediaOptions<O> = {
	host: string;
	fetchFunction: FetchFunctionLike<O>;
	fetchOptions?: O;
	batchSize: number;
}

const DEFAULT_BATCH_SIZE = 50;

/**
 * Type guard for plain object records.
 */
function isObjectRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

/**
 * Type guard for serialized media picker references.
 */
function isMediaReference(value: unknown): value is MediaReference {
	return isObjectRecord(value)
		&& typeof value.mediaKey === 'string'
		&& value.mediaKey.length > 0;
}

/**
 * Heuristic used to avoid converting unrelated empty JSON arrays.
 */
function isMediaLikeKey(key: string | undefined): boolean {
	if (!key) {
		return false;
	}

	const normalizedKey = key.toLowerCase();

	return normalizedKey.includes('media') || normalizedKey.includes('image');
}

/**
 * Parses a JSON-encoded media picker payload.
 *
 * Returns `undefined` for non-media strings, so regular JSON string fields
 * are left untouched by the resolver.
 */
function parseMediaReferenceString(input: string): MediaReference[] | undefined {
	const trimmed = input.trim();

	if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
		return undefined;
	}

	let parsed: unknown;

	try {
		parsed = JSON.parse(trimmed) as unknown;
	} catch {
		return undefined;
	}

	if (!Array.isArray(parsed)) {
		return undefined;
	}

	if (parsed.length === 0) {
		return [];
	}

	const references: MediaReference[] = [];

	for (const item of parsed) {
		if (!isMediaReference(item)) {
			return undefined;
		}

		references.push(item);
	}

	return references;
}

/**
 * Recursively collects all media keys referenced inside a payload.
 */
function collectMediaKeys(value: unknown, mediaKeys: Set<string>, keyHint?: string): void {
	if (typeof value === 'string') {
		const references = parseMediaReferenceString(value);

		if (!references) {
			return;
		}

		if (references.length === 0 && !isMediaLikeKey(keyHint)) {
			return;
		}

		for (const reference of references) {
			mediaKeys.add(reference.mediaKey.toLowerCase());
		}

		return;
	}

	if (Array.isArray(value)) {
		for (const item of value) {
			collectMediaKeys(item, mediaKeys);
		}

		return;
	}

	if (isObjectRecord(value)) {
		for (const [key, nextValue] of Object.entries(value)) {
			collectMediaKeys(nextValue, mediaKeys, key);
		}
	}
}

/**
 * Splits an array into fixed-size chunks.
 */
function chunk<T>(items: T[], size: number): T[][] {
	if (size <= 0) {
		return [items];
	}

	const chunks: T[][] = [];

	for (let index = 0; index < items.length; index += size) {
		chunks.push(items.slice(index, index + size));
	}

	return chunks;
}

/**
 * Fetches media items by id in batches and returns an id-indexed map.
 */
async function fetchMediaByKeys<O>(keys: string[], options: FetchMediaOptions<O>): Promise<Map<string, MediaItem>> {
	const {
		host,
		fetchFunction,
		fetchOptions,
		batchSize,
	} = options;

	const mediaById = new Map<string, MediaItem>();

	for (const keyChunk of chunk(keys, batchSize)) {
		const url = buildDeliveryApiUrl(host, '/api/v2/media/items');
		url.searchParams.set('expand', 'properties[$all]');
		url.searchParams.set('fields', 'properties[$all]');

		for (const id of keyChunk) {
			url.searchParams.append('id', id);
		}

		const fetchedMedia = await fetchFunction<MediaItem[]>({ url, options: fetchOptions });

		if (!Array.isArray(fetchedMedia)) {
			continue;
		}

		for (const mediaItem of fetchedMedia) {
			if (typeof mediaItem.id !== 'string') {
				continue;
			}

			mediaById.set(mediaItem.id.toLowerCase(), mediaItem);
		}
	}

	return mediaById;
}

/**
 * Merges server crops and picker-local crops while deduplicating entries.
 */
function mergeCrops(mediaItem: MediaItem, reference: MediaReference): unknown[] | undefined {
	const mediaCrops = Array.isArray(mediaItem.crops)
		? mediaItem.crops
		: [];
	const referenceCrops = Array.isArray(reference.crops)
		? reference.crops
		: [];

	if (mediaCrops.length === 0 && referenceCrops.length === 0) {
		return undefined;
	}

	const mergedCrops: unknown[] = [];
	const seen = new Set<string>();

	for (const crop of [...mediaCrops, ...referenceCrops]) {
		const key = JSON.stringify(crop);

		if (seen.has(key)) {
			continue;
		}

		seen.add(key);
		mergedCrops.push(crop);
	}

	return mergedCrops;
}

/**
 * Hydrates a serialized media picker string into resolved media objects.
 */
function hydrateStringValue(value: string, keyHint: string | undefined, mediaById: Map<string, MediaItem>, onMissingMedia: MissingMediaMode): unknown {
	const references = parseMediaReferenceString(value);

	if (!references) {
		return value;
	}

	if (references.length === 0) {
		return isMediaLikeKey(keyHint)
			? []
			: value;
	}

	return references.map((reference) => {
		const mediaItem = mediaById.get(reference.mediaKey.toLowerCase());

		if (!mediaItem) {
			const message = `Could not resolve media item with id ${reference.mediaKey}`;

			if (onMissingMedia === 'throw') {
				throw new Error(message);
			}

			console.warn(message);
			return reference;
		}

		const crops = mergeCrops(mediaItem, reference);

		return {
			...mediaItem,
			...(crops ? { crops } : {}),
			...(reference.focalPoint !== undefined ? { focalPoint: reference.focalPoint } : {}),
		};
	});
}

/**
 * Recursively hydrates media references in nested payload structures.
 */
function hydrateMediaReferences(value: unknown, mediaById: Map<string, MediaItem>, onMissingMedia: MissingMediaMode, keyHint?: string): unknown {
	if (typeof value === 'string') {
		return hydrateStringValue(value, keyHint, mediaById, onMissingMedia);
	}

	if (Array.isArray(value)) {
		return value.map((item) => hydrateMediaReferences(item, mediaById, onMissingMedia));
	}

	if (isObjectRecord(value)) {
		const output: Record<string, unknown> = {};

		for (const [key, nextValue] of Object.entries(value)) {
			output[key] = hydrateMediaReferences(nextValue, mediaById, onMissingMedia, key);
		}

		return output;
	}

	return value;
}

/**
 * Resolves serialized media picker references to full media API items.
 *
 * This supports nested structures such as block list/grid payloads where
 * media picker values can be JSON strings containing `mediaKey` references.
 */
export async function resolveMediaPickerReferences<T, O = RequestInit>(value: T, options: MediaResolverOptions<O>): Promise<T> {
	const {
		host,
		fetchFunction,
		fetchOptions,
		enabled = true,
		batchSize = DEFAULT_BATCH_SIZE,
		onMissingMedia = 'warn-and-keep',
	} = options;

	if (!enabled) {
		return value;
	}

	const mediaKeys = new Set<string>();
	collectMediaKeys(value, mediaKeys);

	const mediaById = mediaKeys.size === 0
		? new Map<string, MediaItem>()
		: await fetchMediaByKeys(Array.from(mediaKeys), {
			host,
			fetchFunction,
			fetchOptions,
			batchSize,
		});

	return hydrateMediaReferences(value, mediaById, onMissingMedia) as T;
}

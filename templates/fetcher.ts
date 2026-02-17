import { BaseDocumentType } from './base-types';
import { ExpandParam, ExpandResult } from './utils';
import { buildDeliveryApiUrl } from './delivery-api';
import { FetchFunctionLike, MissingMediaMode, resolveMediaPickerReferences } from './media-resolver';

type SortDirection = 'asc' | 'desc';

/**
 * Query options supported by Delivery API content endpoints.
 */
interface QueryOptions<T extends BaseDocumentType> {
	expand?: ExpandParam<T>;
	filter?: {
		contentType?: string;
		name?: string;
	};
	fetch?: {
		ancestors?: string;
		children?: string;
		descendants?: string;
	};
	sort?: {
		createDate?: SortDirection;
		updateDate?: SortDirection;
		level?: SortDirection;
		name?: SortDirection;
		sortOrder?: SortDirection;
	};
	take?: number;
	skip?: number;
}

/**
 * Optional behavior switches for generated content fetchers.
 */
export interface ContentFetcherOptions {
	/** Enables recursive media picker hydration in fetched content payloads. */
	resolveMediaPickers?: boolean;
	/** Maximum number of media ids per hydration request to `/media/items`. */
	mediaBatchSize?: number;
	/** Behavior used when a media reference cannot be resolved. */
	onMissingMedia?: MissingMediaMode;
}

/**
 * Serializes high-level query options into Delivery API v2 query parameters.
 */
function buildQueryParams<T extends BaseDocumentType>(options: QueryOptions<T>) {
	const queryParams = new URLSearchParams();

	if (options.expand === 'all') {
		queryParams.set('expand', 'properties[$all]');
	} else if (Array.isArray(options.expand) && options.expand.length !== 0) {
		queryParams.append('expand', `properties[${options.expand.join(',')}]`);
	}

	if (options.fetch?.ancestors) {
		queryParams.set('fetch', 'ancestors:' + options.fetch.ancestors);
	}

	if (options.fetch?.descendants) {
		queryParams.set('fetch', 'descendants:' + options.fetch.descendants);
	}

	if (options.fetch?.children) {
		queryParams.set('fetch', 'children:' + options.fetch?.children);
	}

	if (options.filter?.contentType) {
		queryParams.append('filter', 'contentType:' + options.filter.contentType);
	}

	if (options.filter?.name) {
		queryParams.append('filter', 'name:' + options.filter.name);
	}

	if (options.sort) {
		Object
			.entries(options.sort)
			.forEach(([key, value]) => {
				queryParams.append('sort', `${key}:${value}`);
			});
	}

	if (options.take) {
		queryParams.set('take', options.take.toString());
	}

	if (options.skip) {
		queryParams.set('skip', options.skip.toString());
	}

	return queryParams;
}

type UmbracoHeaders = [string, string][] | Record<string, string> | Headers | {
	'Preview'?: 'true' | 'false' | boolean;
	'Api-Key'?: string;
	'Start-Item'?: string;
	'Accept-Language'?: string;
}

/**
 * A function that fetches data from a url.
 * Takes a generic type parameter to specify the return type.
 * @example
 * ```ts
 * async <T>({ url }: { url: URL }): Promise<T>
 * 	const response = await fetch(url);
 * 	if (!response.ok) {
 * 		throw new Error(response.statusText);
 * 	}
 * 	return response.json();
 * }
 * ```
 */
export type FetchFunction<O = RequestInit & { headers?: UmbracoHeaders }> = FetchFunctionLike<O>;

/**
 * Default network implementation used by generated fetchers.
 */
const defaultFetchFunction: FetchFunction = async <T>({ url, options }: { url: URL, options?: RequestInit }) => {
	const response = await fetch(url, options);
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return response.json() as T;
}

/**
 * Normalizes content item identifier/path values for endpoint construction.
 *
 * Empty input resolves to `/api/v2/content/item`, while non-empty values are
 * trimmed and attached to `/api/v2/content/item/{idOrPath}`.
 */
function buildContentItemEndpoint(idOrPath: string | undefined): string {
	const normalizedIdOrPath = (idOrPath || '')
		.trim()
		.replace(/^\/+|\/+$/g, '')
		.replace(/\/{2,}/g, '/');

	return normalizedIdOrPath === ''
		? '/api/v2/content/item'
		: `/api/v2/content/item/${normalizedIdOrPath}`;
}

/**
 * Builds a typed fetch function for getting content by query.
 *
 * The returned function targets Delivery API v2 and can optionally hydrate
 * media picker references into full media items.
 * @example
 * ```ts
 * const customFetchFunction: FetchFunction = async <T>({ url }: { url: URL }) => {
 * 	const response = await fetch(url);
 * 	if (!response.ok) {
 * 		throw new Error(response.statusText);
 * 	}
 * 	return response.json() as T;
 * }
 *
 * const getContent = buildContentFetcher<Content>('https://example.com', customFetchFunction);
 * ```
 */
export function buildContentFetcher<Doc extends BaseDocumentType>(
	host: string,
	fetchFunction: FetchFunction = defaultFetchFunction,
	resolverOptions: ContentFetcherOptions = {}
) {
	// We need to return a function that takes the expand options, because Typescript doesn't support partial type inference yet.
	return async <T extends ExpandParam<Doc> = undefined>(opts?: { expand?: T } & QueryOptions<Doc>, fetchOptions?: RequestInit | undefined) => {
		const queryParams = buildQueryParams<Doc>(opts || {});

		const url = buildDeliveryApiUrl(host, '/api/v2/content');
		url.search = queryParams.toString();

		const response = await fetchFunction<{ total: number, items: ExpandResult<Doc, T>[] }>({ url, options: fetchOptions });

		return resolveMediaPickerReferences(response, {
			host,
			fetchFunction,
			fetchOptions,
			enabled: resolverOptions.resolveMediaPickers ?? true,
			batchSize: resolverOptions.mediaBatchSize,
			onMissingMedia: resolverOptions.onMissingMedia,
		});
	}
}

/**
 * Builds a typed fetch function for getting content by id.
 *
 * The returned function targets Delivery API v2 and can optionally hydrate
 * media picker references into full media items.
 *
 * Passing an empty id/path (for example `''` or `'/'`) targets
 * `/api/v2/content/item` directly.
 * @example
 * ```ts
 * const customFetchFunction: FetchFunction = async <T>({ url }: { url: URL }) => {
 * 	const response = await fetch(url);
 * 	if (!response.ok) {
 * 		throw new Error(response.statusText);
 * 	}
 * 	return response.json() as T;
 * }
 *
 * const getContentById = buildContentItemFetcher<Content>('https://example.com', customFetchFunction);
 * ```
 */
export function buildContentItemFetcher<Doc extends BaseDocumentType>(
	host: string,
	fetchFunction: FetchFunction = defaultFetchFunction,
	resolverOptions: ContentFetcherOptions = {}
) {
	// We need to return a function that takes the expand options, because Typescript doesn't support partial type inference yet.
	return async <T extends ExpandParam<Doc> = undefined>(id?: string, opts?: { expand?: T }, fetchOptions?: RequestInit | undefined) => {
		const queryParams = buildQueryParams<Doc>(opts || {});
		const endpoint = buildContentItemEndpoint(id);
		const url = buildDeliveryApiUrl(host, endpoint);
		url.search = queryParams.toString();

		const response = await fetchFunction<ExpandResult<Doc, T>>({ url, options: fetchOptions });

		return resolveMediaPickerReferences(response, {
			host,
			fetchFunction,
			fetchOptions,
			enabled: resolverOptions.resolveMediaPickers ?? true,
			batchSize: resolverOptions.mediaBatchSize,
			onMissingMedia: resolverOptions.onMissingMedia,
		});
	}
}

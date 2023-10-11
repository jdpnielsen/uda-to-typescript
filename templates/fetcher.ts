import { BaseDocumentType } from './base-types';
import { ExpandParam, ExpandResult } from './utils';

type SortDirection = 'asc' | 'desc';

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
}

function buildQueryParams<T extends BaseDocumentType>(options: QueryOptions<T>) {
	const queryParams = new URLSearchParams();

	if (options.expand === 'all') {
		queryParams.set('expand', 'all');
	} else if (Array.isArray(options.expand)) {
		queryParams.append('expand', 'property:' + options.expand.join(','));
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
		queryParams.set('filter', 'contentType:' + options.filter.contentType);
	}

	if (options.filter?.name) {
		queryParams.set('filter', 'name:' + options.filter.name);
	}

	if (options.sort) {
		Object
			.entries(options.sort)
			.forEach(([key, value]) => {
				queryParams.set('orderBy', `${key}:${value}`);
			});
	}

	return queryParams;
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
export type FetchFunction = <T>({ url }: { url: URL }) => Promise<T>;

const defaultFetchFunction: FetchFunction = async <T>({ url }: { url: URL }) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return response.json() as T;
}

/**
 * Builds a typed fetch function for getting content by query.
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
 * const getContent = buildContentFetcher<Content>('https://example.com/umbraco/delivery', customFetchFunction);
 * ```
 */
export function buildContentFetcher<Doc extends BaseDocumentType>(host: string, fetchFunction: FetchFunction = defaultFetchFunction) {
	// We need to return a function that takes the expand options, because Typescript doesn't support partial type inference yet.
	return async <T extends ExpandParam<Doc> = undefined>(opts?: { expand?: T } & QueryOptions<Doc>) => {
		const queryParams = buildQueryParams<Doc>(opts || {});

		const url = new URL(`${host}/umbraco/delivery/api/v1/content`, host);
		url.search = queryParams.toString();

		return fetchFunction<{ total: number, items: ExpandResult<Doc, T>[] }>({ url });
	}
}

/**
 * Builds a typed fetch function for getting content by id.
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
 * const getContentById = buildContentItemFetcher<Content>('https://example.com/umbraco/delivery', customFetchFunction);
 * ```
 */
export function buildContentItemFetcher<Doc extends BaseDocumentType>(host: string, fetchFunction: FetchFunction = defaultFetchFunction) {
	// We need to return a function that takes the expand options, because Typescript doesn't support partial type inference yet.
	return async <T extends ExpandParam<Doc> = undefined>(id: string, opts?: { expand?: T }) => {
		const queryParams = buildQueryParams<Doc>(opts || {});

		const url = new URL(`${host}/umbraco/delivery/api/v1/content/item/${id}`, host);
		url.search = queryParams.toString();

		return fetchFunction<ExpandResult<Doc, T>>({ url });
	}
}

import { BaseDocumentType } from './base-types';
import { ExpandParam, ExpandResult, Fields, OmitFields } from './utils';

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
	fields?: Fields<T>;
	take?: number;
	skip?: number;
}

function buildQueryParams<T extends BaseDocumentType>(options: QueryOptions<T>) {
	const queryParams = new URLSearchParams();

	if (options.expand === '$all') {
		queryParams.set('expand', 'properties[$all]');
	} else if (Array.isArray(options.expand)) {
		queryParams.append('expand', 'properties[' + options.expand.join(',') + ']');
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

	if (options.fields) {
		queryParams.set('fields', `properties[${buildFieldQuery(options.fields)}]`);
	}

	if (options.sort) {
		Object
			.entries(options.sort)
			.forEach(([key, value]) => {
				queryParams.set('sort', `${key}:${value}`);
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

export function buildFieldQuery<T extends BaseDocumentType = BaseDocumentType>(fields: string | Fields<T>): string {
	if (typeof fields === 'string') {
		return fields;
	} else if (Array.isArray(fields)) {
		return fields.map((e) => buildFieldQuery<T>(e as string | Fields<T>)).join(',');
	} else {
		return Object
			.entries(fields)
			.map(([key, value]) => {
				return `${key}[properties[${buildFieldQuery(value as Fields<BaseDocumentType>)}]]`;
			})
			.join(',')
	}
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
export type FetchFunction<O = RequestInit & { headers?: UmbracoHeaders }> = <T>({ url, options }: { url: URL, options?: O }) => Promise<T>;

const defaultFetchFunction: FetchFunction = async <T>({ url, options }: { url: URL, options?: RequestInit }) => {
	const response = await fetch(url, options);
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
 * const getContent = buildContentFetcher<Content>('https://example.com', customFetchFunction);
 * ```
 */
export function buildContentFetcher<Doc extends BaseDocumentType>(host: string, fetchFunction: FetchFunction = defaultFetchFunction) {
	// We need to return a function that takes the expand options, because Typescript doesn't support partial type inference yet.
	return async <F extends Fields<Doc> = ['$all'], T extends ExpandParam<OmitFields<Doc, F>> = undefined>(opts?: { expand?: T; fields?: F; } & QueryOptions<Doc>, fetchOptions?: RequestInit | undefined) => {
		const queryParams = buildQueryParams<Doc>(opts || {});

		const url = new URL(`${host}/umbraco/delivery/api/v2/content`, host);
		url.search = queryParams.toString();

		return fetchFunction<{ total: number, items: ExpandResult<OmitFields<Doc, F>, T>[] }>({ url, options: fetchOptions});
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
 * const getContentById = buildContentItemFetcher<Content>('https://example.com', customFetchFunction);
 * ```
 */
export function buildContentItemFetcher<Doc extends BaseDocumentType>(host: string, fetchFunction: FetchFunction = defaultFetchFunction) {
	// We need to return a function that takes the expand options, because Typescript doesn't support partial type inference yet.
	return async <F extends Fields<Doc> = ['$all'], T extends ExpandParam<OmitFields<Doc, F>> = undefined>(id: string, opts?: { expand?: T; fields?: F; } & QueryOptions<Doc>, fetchOptions?: RequestInit | undefined) => {
		const queryParams = buildQueryParams<Doc>(opts || {});

		const url = new URL(`${host}/umbraco/delivery/api/v2/content/item/${id}`, host);
		url.search = queryParams.toString();

		return fetchFunction<ExpandResult<OmitFields<Doc, F>, T>>({ url, options: fetchOptions });
	}
}

/**
 * Builds a typed fetch function for getting content by ids.
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
export function buildContentItemsFetcher<Doc extends BaseDocumentType>(host: string, fetchFunction: FetchFunction = defaultFetchFunction) {
	// We need to return a function that takes the expand options, because Typescript doesn't support partial type inference yet.
	return async <F extends Fields<Doc> = ['$all'], T extends ExpandParam<OmitFields<Doc, F>> = undefined>(opts?: { ids: string[]; expand?: T; fields?: F; } & QueryOptions<Doc>, fetchOptions?: RequestInit | undefined) => {
		const queryParams = buildQueryParams<Doc>(opts || {});

		const url = new URL(`${host}/umbraco/delivery/api/v2/content/items`, host);
		url.search = queryParams.toString();

		return fetchFunction<ExpandResult<OmitFields<Doc, F>, T>[]>({ url, options: fetchOptions });
	}
}

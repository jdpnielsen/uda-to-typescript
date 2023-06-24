import { BaseDocumentType } from './base-types';
import { ExpandParam, ExpandResult } from './utils';

interface QueryOptions<T extends BaseDocumentType> {
	expand?: ExpandParam<T>;
}

function buildQueryParams<T extends BaseDocumentType>(options: QueryOptions<T>) {
	const queryParams = new URLSearchParams();

	if (options.expand === 'all') {
		queryParams.set('expand', 'all');
	} else if (Array.isArray(options.expand)) {
		queryParams.append('expand', 'property:' + options.expand.join(','));
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
type FetchFunction = <T>({ url }: { url: URL }) => Promise<T>;

const defaultFetchFunction: FetchFunction = async <T>({ url }: { url: URL }) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return response.json() as T;
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
	* const getContentById = getContentItemByIdFetcher<Content>('https://example.com/umbraco/delivery', customFetchFunction);
	* ```
	*/
export function getContentItemByIdFetcher<Doc extends BaseDocumentType>(host: string, fetchFunction: FetchFunction = defaultFetchFunction) {
	// We need to return a function that takes the expand options, because Typescript doesn't support partial type inference yet.
	return async <T extends ExpandParam<Doc> = undefined>(id: string, opts?: { expand?: T }) => {
		const queryParams = buildQueryParams<Doc>(opts || {});

		const url = new URL(`${host}/api/v1/content/item/${id}`, host);
		url.search = queryParams.toString();

		return fetchFunction<ExpandResult<Doc, T>>({ url });
	}
}

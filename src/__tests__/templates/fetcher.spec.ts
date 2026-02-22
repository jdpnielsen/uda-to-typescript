import { describe, expect, it } from 'vitest';

import type { BaseBlockListType, BaseDocumentType, BaseMediaType } from '../../../templates/base-types';
import { buildContentFetcher, buildContentItemFetcher } from '../../../templates/fetcher';
import type { FetchFunction } from '../../../templates/fetcher';

type TemplateTestDocument = BaseDocumentType<'siteRoot', {
	blocks: BaseBlockListType;
	meta_image: BaseMediaType[];
	media: BaseMediaType[];
}>;

describe('generated fetcher template', () => {
	it('should use Delivery API v2 routes and expand syntax', async () => {
		const requests: URL[] = [];
		const fetchFunction: FetchFunction = <T>({ url }: { url: URL }) => {
			requests.push(url);

			return Promise.resolve({
				total: 0,
				items: [],
			} as T);
		};

		const fetchContent = buildContentFetcher<TemplateTestDocument>('https://example.com/umbraco/delivery', fetchFunction);

		await fetchContent({
			expand: ['blocks', 'meta_image'],
		});

		expect(requests).toHaveLength(1);
		expect(requests[0].pathname).toBe('/umbraco/delivery/api/v2/content');
		expect(requests[0].searchParams.getAll('expand')).toEqual(['properties[blocks,meta_image]']);
	});

	it('should normalize empty content item identifiers without double slashes', async () => {
		const requests: URL[] = [];
		const fetchFunction: FetchFunction = <T>({ url }: { url: URL }) => {
			requests.push(url);
			return Promise.resolve({} as T);
		};

		const fetchContentItem = buildContentItemFetcher<TemplateTestDocument>('https://localhost:44321', fetchFunction);

		await fetchContentItem('/', { expand: '$all' });
		await fetchContentItem('', { expand: '$all' });

		expect(requests.map((request) => request.pathname)).toEqual([
			'/umbraco/delivery/api/v2/content/item',
			'/umbraco/delivery/api/v2/content/item',
		]);
	});
});

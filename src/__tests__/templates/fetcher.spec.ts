import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import type { BaseBlockListType, BaseBlockType, BaseDocumentType, BaseElementType, BaseMediaType, ContentRoute, Crop, EmptyObjectType, MediaPickerItem } from '../../../templates/base-types';
import { buildContentFetcher, buildContentItemFetcher } from '../../../templates/fetcher';
import type { FetchFunction } from '../../../templates/fetcher';

type Image = MediaPickerItem<BaseMediaType<'Image', { alt: string }>, [
	Crop<'1:1', 500, 500>,
	Crop<'2:1', 1000, 500>,
]>;

type ContentPage = BaseDocumentType<'contentPage', {
	media: Image[];
}>;

type TextBlock = BaseElementType<'textBlock', {
	headline: string;
	contentRef: ContentPage;
}>;

type TemplateTestDocument = BaseDocumentType<'siteRoot', {
	blocks: BaseBlockListType<BaseBlockType<TextBlock, null>>;
	content: ContentPage;
	meta_image: Image[];
	media: MediaPickerItem<Image>[];
}>;

// Fixtures does not actually represent api output
// it's just used to allow property access in our type tests.
const fixture = {
	properties: {
		content: {
			properties: {
				media: [{
					properties: {},
				}],
			},
		},
		media: [{
			properties: {},
		}],
		blocks: {
			items: [{
				content: {
					properties: {
						contentRef: {
							properties: {},
						},
					},
				},
			}],
		},
	},
	cultures: {
		'en-US': {},
	},
};

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

	it('should unexpand properties when no expand parameter is provided', async () => {
		const fetchFunction = vi.fn().mockResolvedValue(fixture);
		const fetchContentItem = buildContentItemFetcher<TemplateTestDocument>('https://localhost:44321', fetchFunction);

		const data = await fetchContentItem('', {});

		expectTypeOf(data.properties.content.properties).toEqualTypeOf<EmptyObjectType>();
		expectTypeOf(data.properties.media[0].properties.alt).toEqualTypeOf<never>();
		expectTypeOf(data.properties.blocks.items[0].content.properties.contentRef.properties).toEqualTypeOf<EmptyObjectType>();
	});

	it('should expand all properties when $all expand parameter is provided', async () => {
		const fetchFunction = vi.fn().mockResolvedValue(fixture);
		const fetchContentItem = buildContentItemFetcher<TemplateTestDocument>('https://localhost:44321', fetchFunction);

		const data = await fetchContentItem('', {
			expand: '$all',
		});

		expectTypeOf(data.properties.content.properties).toEqualTypeOf<ContentPage['properties']>();
		expectTypeOf(data.properties.media[0].properties.alt).toEqualTypeOf<string>();
		expectTypeOf(data.properties.blocks.items[0].content.properties.contentRef.properties).toEqualTypeOf<ContentPage['properties']>();
	});

	it('should unexpand all but blocks property when only blocks is expanded', async () => {
		const fetchFunction = vi.fn().mockResolvedValue(fixture);
		const fetchContentItem = buildContentItemFetcher<TemplateTestDocument>('https://localhost:44321', fetchFunction);

		const data = await fetchContentItem('', {
			expand: ['blocks'],
		});

		expectTypeOf(data.properties.content.properties).toEqualTypeOf<EmptyObjectType>();
		expectTypeOf(data.properties.media[0].properties.alt).toEqualTypeOf<never>();
		expectTypeOf(data.properties.blocks.items[0].content.properties.contentRef.properties).toEqualTypeOf<ContentPage['properties']>();
	});

	it('should unexpand all but content property when only media is expanded', async () => {
		const fetchFunction = vi.fn().mockResolvedValue(fixture);
		const fetchContentItem = buildContentItemFetcher<TemplateTestDocument>('https://localhost:44321', fetchFunction);

		const data = await fetchContentItem('', {
			expand: ['media'],
		});

		expectTypeOf(data.properties.content.properties).toEqualTypeOf<EmptyObjectType>();
		expectTypeOf(data.properties.media[0].properties.alt).toEqualTypeOf<string>();
	});

	it('should unexpand all but media properties when only content is expanded', async () => {
		const fetchFunction = vi.fn().mockResolvedValue(fixture);
		const fetchContentItem = buildContentItemFetcher<TemplateTestDocument>('https://localhost:44321', fetchFunction);

		const data = await fetchContentItem('', {
			expand: ['content'],
		});

		expectTypeOf(data.properties.content.properties).toEqualTypeOf<ContentPage['properties']>();
		expectTypeOf(data.properties.content.properties.media[0].properties.alt).toEqualTypeOf<string>();
		expectTypeOf(data.properties.media[0].properties.alt).toEqualTypeOf<never>();
	});

	it('should support multi language setup', async () => {
		type ContentPage = BaseDocumentType<'contentPage', {
			media: Image[];
		}, {
			['en-US']: ContentRoute;
			['da-DK']?: ContentRoute;
		}>;

		const fetchFunction = vi.fn().mockResolvedValue(fixture);
		const fetchContentItem = buildContentItemFetcher<ContentPage>('https://localhost:44321', fetchFunction);

		const data = await fetchContentItem('');

		expectTypeOf(data.cultures).toEqualTypeOf<ContentPage['cultures']>();
		expectTypeOf(data.cultures['en-US'].path).toEqualTypeOf<string>();
		expectTypeOf(data.cultures['da-DK']).toEqualTypeOf<ContentRoute | undefined>();
	});
});

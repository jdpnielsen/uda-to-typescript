import { buildContentFetcher, buildContentItemFetcher, FetchFunction } from '../../../templates/fetcher';
import { BaseBlockListType, BaseDocumentType, BaseMediaType } from '../../../templates/base-types';

type TemplateTestDocument = BaseDocumentType<'siteRoot', {
	blocks: BaseBlockListType;
	meta_image: BaseMediaType[];
	media: BaseMediaType[];
}>;

type HydratedMediaResponse = {
	items: Array<{
		properties: {
			blocks: {
				items: Array<{
					content: {
						properties: {
							media: Array<Record<string, unknown>>;
						};
					};
				}>;
			};
		};
	}>;
}

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

		const fetchContent = buildContentFetcher<TemplateTestDocument>('https://example.com/umbraco/delivery', fetchFunction, {
			resolveMediaPickers: false,
		});

		await fetchContent({
			expand: ['blocks', 'meta_image'],
		});

		expect(requests).toHaveLength(1);
		expect(requests[0].pathname).toBe('/umbraco/delivery/api/v2/content');
		expect(requests[0].searchParams.getAll('expand')).toEqual(['properties[blocks,meta_image]']);
	});

	it('should resolve media picker references using media keys', async () => {
		const mediaKey = '8709e050-18c5-426c-a474-317eed731ec8';
		const requests: URL[] = [];

		const fetchFunction: FetchFunction = <T>({ url }: { url: URL }) => {
			requests.push(url);

			if (url.pathname === '/umbraco/delivery/api/v2/content') {
				return Promise.resolve({
					total: 1,
					items: [
						{
							id: 'c95d15c2-8a99-497c-aca3-ad31d3cf3956',
							contentType: 'siteRoot',
							name: 'Frontpage',
							createDate: '2022-10-11T18:32:39.950Z',
							updateDate: '2022-11-24T13:46:29.157Z',
							route: {
								path: '/',
								startItem: {
									id: 'c95d15c2-8a99-497c-aca3-ad31d3cf3956',
									path: '/',
								},
							},
							cultures: {},
							properties: {
								blocks: {
									items: [
										{
											content: {
												properties: {
													media: '[{"key":"9b4e7167-dcbc-41ce-8b8a-0a5b389777b2","mediaKey":"8709e050-18c5-426c-a474-317eed731ec8","mediaTypeAlias":"Image","crops":[{"alias":"local","width":1200,"height":630,"coordinates":null}],"focalPoint":{"left":0.4,"top":0.6}}]',
												},
											},
											settings: null,
										},
									],
								},
							},
						},
					],
				} as T);
			}

			if (url.pathname === '/umbraco/delivery/api/v2/media/items') {
				expect(url.searchParams.getAll('id')).toEqual([mediaKey]);

				return Promise.resolve([
					{
						id: mediaKey,
						mediaType: 'Image',
						name: 'Furry Red',
						url: '/media/k1qatb4f/furry_red.jpg',
						extension: 'jpg',
						width: 1500,
						height: 1113,
						bytes: 269490,
						properties: {},
						focalPoint: null,
						crops: [
							{
								alias: '16:9',
								width: 1600,
								height: 900,
								coordinates: null,
							},
						],
					},
				] as T);
			}

			throw new Error(`Unexpected URL ${url.toString()}`);
		};

		const fetchContent = buildContentFetcher<TemplateTestDocument>('https://example.com', fetchFunction);
		const response = await fetchContent({ expand: 'all' });

		expect(requests.map((request) => request.pathname)).toEqual([
			'/umbraco/delivery/api/v2/content',
			'/umbraco/delivery/api/v2/media/items',
		]);

		const hydratedResponse = response as unknown as HydratedMediaResponse;
		const media = hydratedResponse.items[0].properties.blocks.items[0].content.properties.media;

		expect(Array.isArray(media)).toBe(true);
		expect(media[0]).toEqual(expect.objectContaining({
			id: mediaKey,
			mediaType: 'Image',
		}));
		expect(media[0].focalPoint).toEqual({ left: 0.4, top: 0.6 });
		expect(media[0].crops).toEqual(expect.arrayContaining([
			expect.objectContaining({ alias: '16:9' }),
			expect.objectContaining({ alias: 'local' }),
		]));
	});

	it('should throw when missing media references are configured as strict', async () => {
		const requests: URL[] = [];
		const missingMediaId = '11111111-1111-1111-1111-111111111111';

		const fetchFunction: FetchFunction = <T>({ url }: { url: URL }) => {
			requests.push(url);

			if (url.pathname === '/umbraco/delivery/api/v2/content/item/content-id') {
				return Promise.resolve({
					id: 'content-id',
					contentType: 'mediaBlock',
					properties: {
						media: `[{"key":"9b4e7167-dcbc-41ce-8b8a-0a5b389777b2","mediaKey":"${missingMediaId}","mediaTypeAlias":"Image","crops":[],"focalPoint":null}]`,
					},
				} as T);
			}

			if (url.pathname === '/umbraco/delivery/api/v2/media/items') {
				return Promise.resolve([] as T);
			}

			throw new Error(`Unexpected URL ${url.toString()}`);
		};

		const fetchContentItem = buildContentItemFetcher<TemplateTestDocument>('https://example.com', fetchFunction, {
			onMissingMedia: 'throw',
		});

		await expect(fetchContentItem('content-id', { expand: 'all' }))
			.rejects
			.toThrow(`Could not resolve media item with id ${missingMediaId}`);

		expect(requests.map((request) => request.pathname)).toEqual([
			'/umbraco/delivery/api/v2/content/item/content-id',
			'/umbraco/delivery/api/v2/media/items',
		]);
	});

	it('should normalize empty content item identifiers without double slashes', async () => {
		const requests: URL[] = [];
		const fetchFunction: FetchFunction = <T>({ url }: { url: URL }) => {
			requests.push(url);
			return Promise.resolve({} as T);
		};

		const fetchContentItem = buildContentItemFetcher<TemplateTestDocument>('https://localhost:44321', fetchFunction, {
			resolveMediaPickers: false,
		});

		await fetchContentItem('/', { expand: 'all' });
		await fetchContentItem('', { expand: 'all' });
		await fetchContentItem(undefined, { expand: 'all' });

		expect(requests.map((request) => request.pathname)).toEqual([
			'/umbraco/delivery/api/v2/content/item',
			'/umbraco/delivery/api/v2/content/item',
			'/umbraco/delivery/api/v2/content/item',
		]);
	});
});

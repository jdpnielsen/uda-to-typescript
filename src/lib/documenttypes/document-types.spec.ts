import { describe, expect, it } from 'vitest';
import { collectArtifacts } from '../helpers/collect-artifacts';
import { dataTypeMap } from '../datatypes';
import { printType } from '../helpers/test';
import { documentHandler } from './index';

describe('documentHandler', async () => {
	const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/current/*.uda');

	it('should return a constructed document when provided with artifacts', () => {
		const output = documentHandler.build({
			Name: 'Site root',
			Alias: 'siteRoot',
			DefaultTemplate: 'umb://template/2f23da3887f44c9da0e198ef889b4b56',
			AllowedTemplates: [
				'umb://template/2f23da3887f44c9da0e198ef889b4b56',
			],
			HistoryCleanup: {},
			Icon: 'icon-globe color-black',
			Thumbnail: 'folder.png',
			Permissions: {
				AllowedAtRoot: true,
				AllowedChildContentTypes: [],
			},
			Parent: 'umb://document-type-container/a7c30af313db48139d1d17ca30f1ed19',
			CompositionContentTypes: [],
			PropertyGroups: [
				{
					Key: '9cd02828-b59a-44f1-a35d-865e5da3e68a',
					Name: 'Header',
					Alias: 'content/header',
					PropertyTypes: [
						{
							Key: '16ecaff4-3f00-4f01-b7ce-f847f5e682fd',
							Alias: 'header_menu',
							DataType: 'umb://data-type/7089273755e3415ca5aa01758daeb951',
							Name: 'Menu',
						},
					],
				},
			],
			PropertyTypes: [],
			Udi: 'umb://document-type/8856c80b6f524f87969a863a61eaa6aa',
			Dependencies: [],
			__type: 'Umbraco.Deploy.Infrastructure,Umbraco.Deploy.Infrastructure.Artifacts.ContentType.DocumentTypeArtifact',
			__version: '17.0.1',
		}, {
			artifacts,
			dataTypeHandlers: dataTypeMap,
		});

		const value = printType(output);

		expect(value).toMatchInlineSnapshot(`
			"export type SiteRoot = BaseDocumentType<"siteRoot", {
			    header_menu?: NavigationBlockList;
			}>;
			"
		`);
	});

	it('should extend composite types', () => {
		const output = documentHandler.build({
			Name: 'Site root',
			Alias: 'siteRoot',
			DefaultTemplate: 'umb://template/2f23da3887f44c9da0e198ef889b4b56',
			AllowedTemplates: [],
			HistoryCleanup: {},
			Icon: 'icon-globe color-black',
			Thumbnail: 'folder.png',
			Permissions: {
				AllowedAtRoot: true,
				AllowedChildContentTypes: [],
			},
			Parent: 'umb://document-type-container/a7c30af313db48139d1d17ca30f1ed19',
			CompositionContentTypes: [
				'umb://document-type/7b69656f52b34755a3a2eb6f10964a7e',
				'umb://document-type/a98e256b8c1e47268fb58124626ee349',
			],
			PropertyGroups: [
				{
					Key: '9cd02828-b59a-44f1-a35d-865e5da3e68a',
					Name: 'Header',
					Alias: 'content/header',
					PropertyTypes: [
						{
							Key: '16ecaff4-3f00-4f01-b7ce-f847f5e682fd',
							Alias: 'header_menu',
							DataType: 'umb://data-type/7089273755e3415ca5aa01758daeb951',
							Name: 'Menu',
						},
					],
				},
			],
			PropertyTypes: [],
			Udi: 'umb://document-type/8856c80b6f524f87969a863a61eaa6aa',
			Dependencies: [],
			__type: 'Umbraco.Deploy.Infrastructure,Umbraco.Deploy.Infrastructure.Artifacts.ContentType.DocumentTypeArtifact',
			__version: '17.0.1',
		}, {
			artifacts,
			dataTypeHandlers: dataTypeMap,
		});

		const value = printType(output);

		expect(value).toMatchInlineSnapshot(`
			"export type SiteRoot = BaseDocumentType<"siteRoot", Metadata["properties"] & PageSettings["properties"] & {
			    header_menu?: NavigationBlockList;
			}>;
			"
		`);
	});

	it('should return an element type when IsElementType is true', () => {
		const output = documentHandler.build({
			Name: 'Richtext block',
			Alias: 'richtextBlock',
			AllowedTemplates: [],
			HistoryCleanup: {},
			Icon: 'icon-science',
			Thumbnail: 'folder.png',
			Permissions: {
				IsElementType: true,
				AllowedChildContentTypes: [],
			},
			Parent: 'umb://document-type-container/040eb249f729475dbeaa4eaf0ceb276c',
			CompositionContentTypes: [],
			PropertyGroups: [
				{
					Key: 'e396388b-1c3f-4b4e-9853-76094e86fa48',
					Name: 'Content',
					Alias: 'content',
					PropertyTypes: [
						{
							Key: '050f1ab7-8aff-4f7c-90a1-3b24ad20d50a',
							Alias: 'content',
							DataType: 'umb://data-type/ca90c9500aff4e72b976a30b1ac57dad',
							Name: 'Richtext content',
						},
					],
				},
			],
			PropertyTypes: [],
			Udi: 'umb://document-type/5f9ec17739a24d339bcf9d1409630509',
			Dependencies: [],
			__type: 'Umbraco.Deploy.Infrastructure,Umbraco.Deploy.Infrastructure.Artifacts.ContentType.DocumentTypeArtifact',
			__version: '17.0.1',
		}, {
			artifacts,
			dataTypeHandlers: dataTypeMap,
		});

		const value = printType(output);

		expect(value).toMatchInlineSnapshot(`
			"export type RichtextBlock = BaseElementType<"richtextBlock", {
			    content?: RichtextEditor;
			}>;
			"
		`);
	});
});

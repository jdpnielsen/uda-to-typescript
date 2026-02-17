import { collectArtifacts } from './helpers/collect-artifacts';
import { buildTypes } from './build-types';
import ts from 'typescript';
import { readFile } from 'fs/promises';
import { dataTypeMap } from './datatypes';

describe('buildTypes', () => {
	it('Should handle a glob with no files', async () => {
		const artifacts = await collectArtifacts('./__bad_path/*.uda');

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: dataTypeMap
		});
		const expected = ts.createPrinter()
			.printList(
				ts.ListFormat.SingleLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest)
			);

		expect(expected.trim())
			.toBe('import { type BaseDocumentType, type EmptyObjectType, type BaseGridBlockType, type BaseBlockType, type BaseGridBlockAreaType, type BaseBlockListType, type BaseBlockGridType, type BaseMediaType, type Crop, type MediaPickerItem } from "./base-types";');
	});

	it('Should handle a glob with files', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/v13/*.uda');
		const expected = await readFile('./src/__tests__/__fixtures__/v13/output.txt');

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: dataTypeMap
		});

		const actual = ts.createPrinter()
			.printList(
				ts.ListFormat.MultiLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest)
			);

		expect(actual).toBe(expected.toString());
	});

	it('Should handle v17 fixtures without throwing', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/v17/*.uda');
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: dataTypeMap
		});

		const actual = ts.createPrinter()
			.printList(
				ts.ListFormat.MultiLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest)
			);

		expect(warnSpy).not.toHaveBeenCalled();
		expect(actual).toContain('import { type BaseDocumentType');
		expect(actual).toContain('content?: {' );
		expect(actual).toContain('markup: string;');
		expect(actual).toContain('form: string | null;');
		expect(actual).toContain('umbracoBytes: number;');
		expect(actual).toContain('umbracoWidth: number;');
		expect(actual).toContain('export type ApprovedColor = string | null;');

		const navigationBlockListDeclarations = actual.match(/export type NavigationBlockList\s*=/g) || [];
		expect(navigationBlockListDeclarations).toHaveLength(1);

		warnSpy.mockRestore();
	});

	it('Should support disabling data type alias emission', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/v17/*.uda');

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: dataTypeMap,
			emitDataTypeAliases: false,
		});

		const actual = ts.createPrinter()
			.printList(
				ts.ListFormat.MultiLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest)
			);

		expect(actual).not.toContain('export type ApprovedColor =');
	});

	it('Should resolve custom handlers by EditorUiAlias for v17', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/v17/*.uda');

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: {
				...dataTypeMap,
				'Noa.CustomLinkPicker': {
					editorAlias: 'Noa.CustomLinkPicker',
					build: () => [],
					reference: () => ts.factory.createTypeReferenceNode('UrlItem'),
				},
			}
		});

		const actual = ts.createPrinter()
			.printList(
				ts.ListFormat.MultiLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest)
			);

		expect(actual).toContain('link: UrlItem;');
	});
});

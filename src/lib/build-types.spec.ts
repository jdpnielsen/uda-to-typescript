import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import { buildTypes } from './build-types';
import { dataTypeMap } from './datatypes';
import { collectArtifacts } from './helpers/collect-artifacts';

describe('buildTypes', () => {
	it('should handle a glob with no files', async () => {
		const artifacts = await collectArtifacts('./__bad_path/*.uda');

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: dataTypeMap,
		});
		const expected = ts.createPrinter()
			.printList(
				ts.ListFormat.SingleLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest),
			);

		expect(expected.trim())
			.toBe('import { type BaseDocumentType, type EmptyObjectType, type BaseGridBlockType, type BaseBlockType, type BaseGridBlockAreaType, type BaseBlockListType, type BaseBlockGridType, type BaseMediaType, type Crop, type MediaPickerItem } from "./base-types";import { type UmbracoForm } from "./form";');
	});

	it('should handle current fixtures without throwing', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/current/*.uda');
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: dataTypeMap,
		});

		const actual = ts.createPrinter()
			.printList(
				ts.ListFormat.MultiLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest),
			);

		expect(warnSpy).not.toHaveBeenCalled();
		expect(actual).toContain('import { type BaseDocumentType');
		expect(actual).toContain('content?: {');
		expect(actual).toContain('markup: string;');
		expect(actual).toContain('form: UmbracoForm;');
		expect(actual).toContain('umbracoBytes: number;');
		expect(actual).toContain('umbracoWidth: number;');
		expect(actual).toContain('export type ApprovedColor = string | null;');

		const navigationBlockListDeclarations = actual.match(/export type NavigationBlockList\s*=/g) || [];
		expect(navigationBlockListDeclarations).toHaveLength(1);

		warnSpy.mockRestore();
	});

	it('should support disabling data type alias emission', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/current/*.uda');

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: dataTypeMap,
			emitDataTypeAliases: false,
		});

		const actual = ts.createPrinter()
			.printList(
				ts.ListFormat.MultiLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest),
			);

		expect(actual).not.toContain('export type ApprovedColor =');
	});

	it('should resolve custom handlers by EditorUiAlias', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/current/*.uda');

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: {
				...dataTypeMap,
				'Noa.CustomLinkPicker': {
					editorAlias: 'Noa.CustomLinkPicker',
					build: () => [],
					reference: () => ts.factory.createTypeReferenceNode('UrlItem'),
				},
			},
		});

		const actual = ts.createPrinter()
			.printList(
				ts.ListFormat.MultiLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest),
			);

		expect(actual).toContain('link: UrlItem;');
	});
});

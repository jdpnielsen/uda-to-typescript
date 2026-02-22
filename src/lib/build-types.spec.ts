import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import { buildTypes } from './build-types';
import { dataTypeMap } from './datatypes';
import { collectArtifacts } from './helpers/collect-artifacts';
import { printType } from './helpers/test';

describe('buildTypes', () => {
	it('should handle a glob with no files', async () => {
		const artifacts = await collectArtifacts('./__bad_path/*.uda');

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: dataTypeMap,
		});

		const actual = printType(output.map((e) => e));
		expect(actual.trim()).toMatchInlineSnapshot(`
			"import { type BaseDocumentType, type BaseElementType, type EmptyObjectType, type BaseGridBlockType, type BaseBlockType, type BaseGridBlockAreaType, type BaseBlockListType, type BaseBlockGridType, type BaseMediaType, type Crop, type MediaPickerItem } from "./base-types";
			import { type UmbracoForm } from "./form";"
		`);
	});

	it('should handle current fixtures without throwing', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/current/*.uda');
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: dataTypeMap,
		});

		const actual = printType(output.map((e) => e));

		expect(warnSpy).not.toHaveBeenCalled();
		expect(actual).toMatchSnapshot();

		warnSpy.mockRestore();
	});

	it('should support disabling data type alias emission', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/current/*.uda');

		const output = buildTypes({
			artifacts,
			dataTypeHandlers: dataTypeMap,
			emitDataTypeAliases: false,
		});

		const actual = printType(output.map((e) => e));
		expect(actual).toMatchSnapshot();
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

		const actual = printType(output.map((e) => e));
		expect(actual).toMatchSnapshot();
	});
});

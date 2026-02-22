import ts from 'typescript';

import { colorPickerHandler, type ColorPickerConfig } from './Umbraco.ColorPicker';
import type { DataType } from '../types/data-type';

describe('Umbraco.ColorPicker', () => {
	it('should handle build and reference enum', () => {
		const dataType = createDataType<ColorPickerConfig>('Umbraco.CheckBoxList', {
			items: [
				{
					'value': 'e90707',
					'label': 'Red'
				},
				{
					'value': '2157d4',
					'label': 'Blue'
				}
			],
		});

		const buildValue = colorPickerHandler.build(dataType);
		expect(printType(ts.factory.createNodeArray(buildValue))).toMatchInlineSnapshot(`
"export const Test = {
    Red: "e90707",
    Blue: "2157d4"
} as const;
export type Test = (typeof Test)[keyof typeof Test];"
`);

		const reference = colorPickerHandler.reference(dataType);
		expect(printType(reference)).toMatchInlineSnapshot('"Test | null"');
	});

	it('should use label', () => {
		const dataType = createDataType<ColorPickerConfig>('Umbraco.CheckBoxList', {
			useLabel: true,
			items: [
				{
					'value': 'e90707',
					'label': 'Red'
				},
				{
					'value': '2157d4',
					'label': 'Blue'
				}
			],
		});

		const buildValue = colorPickerHandler.build(dataType);
		expect(printType(ts.factory.createNodeArray(buildValue))).toMatchInlineSnapshot(`
"export const Test = {
    Red: "e90707",
    Blue: "2157d4"
} as const;
export type Test = (typeof Test)[keyof typeof Test];"
`);

		const reference = colorPickerHandler.reference(dataType);
		expect(printType(reference)).toMatchInlineSnapshot(`
"{
    value: Test;
    label: keyof typeof Test;
} | null"
`);
	});

	it('should handle missing items', () => {
		const datatype = createDataType<ColorPickerConfig>('Umbraco.CheckBoxList', {
		});

		const buildValue = colorPickerHandler.build(datatype);
		expect(printType(ts.factory.createNodeArray(buildValue))).toBe('');

		const value = colorPickerHandler.reference(datatype);
		expect(printType(value)).toBe('string | null');
	});
});

function createDataType<Config extends Record<string, unknown>>(editorAlias: string, configuration: Config): DataType {
	return {
		Name: 'Test',
		EditorAlias: editorAlias,
		Configuration: configuration,
		Udi: 'umb://data-type/test',
		Dependencies: [],
		__type: 'Umbraco.Deploy.Infrastructure,Umbraco.Deploy.Infrastructure.Artifacts.DataTypeArtifact',
		__version: '17.0.1',
	};
}

function printType(typeNode: ts.TypeNode | ts.NodeArray<ts.Node>): string {
	if (Array.isArray(typeNode)) {
		return ts.createPrinter()
			.printList(
				ts.ListFormat.None,
				typeNode as ts.NodeArray<ts.Node>,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest)
			);
	}

	return ts.createPrinter()
		.printNode(
			ts.EmitHint.Unspecified,
			typeNode as ts.Node,
			ts.createSourceFile('', '', ts.ScriptTarget.Latest)
		);
}

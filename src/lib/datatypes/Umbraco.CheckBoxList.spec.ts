import ts from 'typescript';
import { describe, it, expect } from 'vitest';
import { checkboxListHandler, type CheckboxListConfig } from './Umbraco.CheckBoxList';
import type { DataType } from '../types/data-type';

describe('Umbraco.CheckBoxList', () => {
	describe('legacy data format', () => {
		it('should handle build and reference enum', () => {
			const dataType = createDataType<CheckboxListConfig>('Umbraco.CheckBoxList', {
				items: [
					{ id: 1, value: 'Value 1' },
					{ id: 2, value: 'Value 2' },
					{ id: 3, value: 'Value 3' },
				],
			});

			const buildValue = checkboxListHandler.build(dataType);
			expect(printType(ts.factory.createNodeArray(buildValue))).toMatchInlineSnapshot(`
"export const Test = {
    Value_1: "Value 1",
    Value_2: "Value 2",
    Value_3: "Value 3"
} as const;
export type Test = (typeof Test)[keyof typeof Test];"
`);

			const reference = checkboxListHandler.reference(dataType);
			expect(printType(reference)).toBe('Test[]');
		});

		it('should handle missing items', () => {
			const datatype = createDataType<CheckboxListConfig>('Umbraco.CheckBoxList', {
			});

			const buildValue = checkboxListHandler.build(datatype);
			expect(printType(ts.factory.createNodeArray(buildValue))).toBe('');

			const value = checkboxListHandler.reference(datatype);
			expect(printType(value)).toBe('string[]');
		});
	});

	describe('modern data format', () => {
		it('should handle build and reference enum', () => {
			const datatype = createDataType<CheckboxListConfig>('Umbraco.CheckBoxList', {
				items: [
					'Value 1',
					'Value 2',
					'Value 3',
				],
			});

			const buildValue = checkboxListHandler.build(datatype);
			expect(printType(ts.factory.createNodeArray(buildValue))).toMatchInlineSnapshot(`
"export const Test = {
    Value_1: "Value 1",
    Value_2: "Value 2",
    Value_3: "Value 3"
} as const;
export type Test = (typeof Test)[keyof typeof Test];"
`);

			const value = checkboxListHandler.reference(datatype);
			expect(printType(value)).toBe('Test[]');
		});

		it('should handle missing items', () => {
			const datatype = createDataType<CheckboxListConfig>('Umbraco.CheckBoxList', {
			});

			const buildValue = checkboxListHandler.build(datatype);
			expect(printType(ts.factory.createNodeArray(buildValue))).toMatchInlineSnapshot('""');

			const value = checkboxListHandler.reference(datatype);
			expect(printType(value)).toBe('string[]');
		});
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

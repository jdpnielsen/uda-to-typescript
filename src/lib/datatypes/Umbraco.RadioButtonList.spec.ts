import ts from 'typescript';

import { radioButtonListHandler, type RadioButtonListConfig } from './Umbraco.RadioButtonList';
import type { DataType } from '../types/data-type';

describe('Umbraco.RadioButtonList', () => {
	describe('legacy data format', () => {
		it('should handle build and reference enum', () => {
			const dataType = createDataType<RadioButtonListConfig>('Umbraco.RadioButtonList', {
				items: [
					{ id: 1, value: 'Value 1' },
					{ id: 2, value: 'Value 2' },
					{ id: 3, value: 'Value 3' },
				],
			});

			const buildValue = radioButtonListHandler.build(dataType);
			expect(printType(ts.factory.createNodeArray(buildValue))).toMatchInlineSnapshot(`
"export const Test = {
    Value_1: "Value 1",
    Value_2: "Value 2",
    Value_3: "Value 3"
} as const;
export type Test = (typeof Test)[keyof typeof Test];"
`);

			const reference = radioButtonListHandler.reference(dataType);
			expect(printType(reference)).toBe('Test | null');
		});

		it('should handle missing items', () => {
			const datatype = createDataType<RadioButtonListConfig>('Umbraco.RadioButtonList', {
			});

			const buildValue = radioButtonListHandler.build(datatype);
			expect(printType(ts.factory.createNodeArray(buildValue))).toBe('');

			const value = radioButtonListHandler.reference(datatype);
			expect(printType(value)).toBe('string | null');
		});
	});

	describe('modern data format', () => {
		it('should handle build and reference enum', () => {
			const datatype = createDataType<RadioButtonListConfig>('Umbraco.RadioButtonList', {
				items: [
					'Value 1',
					'Value 2',
					'Value 3',
				],
			});

			const buildValue = radioButtonListHandler.build(datatype);
			expect(printType(ts.factory.createNodeArray(buildValue))).toMatchInlineSnapshot(`
"export const Test = {
    Value_1: "Value 1",
    Value_2: "Value 2",
    Value_3: "Value 3"
} as const;
export type Test = (typeof Test)[keyof typeof Test];"
`);

			const value = radioButtonListHandler.reference(datatype);
			expect(printType(value)).toBe('Test | null');
		});

		it('should handle missing items', () => {
			const datatype = createDataType<RadioButtonListConfig>('Umbraco.RadioButtonList', {
			});

			const buildValue = radioButtonListHandler.build(datatype);
			expect(printType(ts.factory.createNodeArray(buildValue))).toMatchInlineSnapshot('""');

			const value = radioButtonListHandler.reference(datatype);
			expect(printType(value)).toBe('string | null');
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

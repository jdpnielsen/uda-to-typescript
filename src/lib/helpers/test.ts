import ts from 'typescript';

import type { DataType } from '../types/data-type';

export function createDataType<Config extends DataType['Configuration']>(editorAlias: string, configuration: Config): DataType {
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

export function printType(typeNode: ts.Node | ts.Node[]): string {
	if (Array.isArray(typeNode)) {
		return ts.createPrinter()
			.printList(
				ts.ListFormat.MultiLine,
				ts.factory.createNodeArray(typeNode),
				ts.createSourceFile('', '', ts.ScriptTarget.Latest),
			);
	}

	return ts.createPrinter()
		.printNode(
			ts.EmitHint.Unspecified,
			typeNode,
			ts.createSourceFile('', '', ts.ScriptTarget.Latest),
		);
}

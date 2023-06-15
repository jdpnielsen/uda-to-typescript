import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const multipleTextHandler: HandlerConfig = {
	editorAlias: 'Umbraco.MultipleTextstring',
	build: () => [],
	reference: () => factory.createArrayTypeNode(
		factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
	),
}

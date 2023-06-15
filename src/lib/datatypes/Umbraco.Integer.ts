import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const integerHandler: HandlerConfig = {
	editorAlias: 'Umbraco.Integer',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
}

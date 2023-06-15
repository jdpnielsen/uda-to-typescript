import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const trueFalseHandler: HandlerConfig = {
	editorAlias: 'Umbraco.TrueFalse',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
}

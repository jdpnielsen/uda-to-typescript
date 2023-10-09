import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const integerHandler = {
	editorAlias: 'Umbraco.Integer' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
} satisfies HandlerConfig

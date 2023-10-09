import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const trueFalseHandler = {
	editorAlias: 'Umbraco.TrueFalse' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
} satisfies HandlerConfig

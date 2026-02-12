import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const plainIntegerHandler = {
	editorAlias: 'Umbraco.Plain.Integer' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
} satisfies HandlerConfig

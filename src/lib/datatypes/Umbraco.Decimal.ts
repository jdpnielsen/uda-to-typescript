import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const decimalHandler = {
	editorAlias: 'Umbraco.Decimal' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
} satisfies HandlerConfig

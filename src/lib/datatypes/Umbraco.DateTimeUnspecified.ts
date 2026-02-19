import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const dateTimeUnspecifiedHandler = {
	editorAlias: 'Umbraco.DateTimeUnspecified' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig

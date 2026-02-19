import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const dateOnlyHandler = {
	editorAlias: 'Umbraco.DateOnly' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig

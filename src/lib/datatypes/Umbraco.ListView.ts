import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const listViewHandler = {
	editorAlias: 'Umbraco.ListView' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
} satisfies HandlerConfig

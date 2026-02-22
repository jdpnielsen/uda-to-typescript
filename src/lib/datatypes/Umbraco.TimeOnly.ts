import ts, { factory } from 'typescript';

import type { HandlerConfig } from '.';

export const timeOnlyHandler = {
	editorAlias: 'Umbraco.TimeOnly' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig;

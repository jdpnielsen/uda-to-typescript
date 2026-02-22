import ts, { factory } from 'typescript';

import type { HandlerConfig } from '.';

export const plainStringHandler = {
	editorAlias: 'Umbraco.Plain.String' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig;

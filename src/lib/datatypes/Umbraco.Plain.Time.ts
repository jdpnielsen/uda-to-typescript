import ts, { factory } from 'typescript';

import type { HandlerConfig } from '.';

export const plainTimeHandler = {
	editorAlias: 'Umbraco.Plain.Time' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig;

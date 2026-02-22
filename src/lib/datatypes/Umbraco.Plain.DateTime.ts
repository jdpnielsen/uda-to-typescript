import ts, { factory } from 'typescript';

import type { HandlerConfig } from '.';

export const plainDateTimeHandler = {
	editorAlias: 'Umbraco.Plain.DateTime' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig;

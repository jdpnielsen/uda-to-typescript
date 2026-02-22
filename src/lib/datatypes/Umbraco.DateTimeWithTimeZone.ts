import ts, { factory } from 'typescript';

import type { HandlerConfig } from '.';

export const dateTimeWithTimeZoneHandler = {
	editorAlias: 'Umbraco.DateTimeWithTimeZone' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig;

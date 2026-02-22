import ts, { factory } from 'typescript';

import type { HandlerConfig } from '.';

export const plainDecimalHandler = {
	editorAlias: 'Umbraco.Plain.Decimal' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
} satisfies HandlerConfig;

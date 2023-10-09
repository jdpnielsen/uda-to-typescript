import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const dateTimeHandler = {
	editorAlias: 'Umbraco.DateTime' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig

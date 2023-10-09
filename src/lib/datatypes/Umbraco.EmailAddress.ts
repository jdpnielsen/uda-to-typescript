import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const emailAddressHandler = {
	editorAlias: 'Umbraco.EmailAddress' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig

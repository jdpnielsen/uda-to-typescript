import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const textboxHandler = {
	editorAlias: 'Umbraco.TextBox' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig

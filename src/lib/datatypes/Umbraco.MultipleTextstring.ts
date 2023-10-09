import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const multipleTextHandler = {
	editorAlias: 'Umbraco.MultipleTextstring' as const,
	build: () => [],
	reference: () => factory.createArrayTypeNode(
		factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
	),
} satisfies HandlerConfig

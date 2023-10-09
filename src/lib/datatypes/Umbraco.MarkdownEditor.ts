import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const markdownEditorHandler = {
	editorAlias: 'Umbraco.MarkdownEditor' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig

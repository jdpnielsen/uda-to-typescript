import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const textareaHandler = {
	editorAlias: 'Umbraco.TextArea' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig

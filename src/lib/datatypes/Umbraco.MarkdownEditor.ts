import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const markdownEditorHandler: HandlerConfig = {
	editorAlias: 'Umbraco.MarkdownEditor',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}

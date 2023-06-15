import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const textareaHandler: HandlerConfig = {
	editorAlias: 'Umbraco.TextArea',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}

import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const tinyMCEHandler: HandlerConfig = {
	editorAlias: 'Umbraco.TinyMCE',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}

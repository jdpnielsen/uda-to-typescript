import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const textboxHandler: HandlerConfig = {
	editorAlias: 'Umbraco.TextBox',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}

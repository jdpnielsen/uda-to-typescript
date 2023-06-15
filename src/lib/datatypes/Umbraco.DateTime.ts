import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const dateTimeHandler: HandlerConfig = {
	editorAlias: 'Umbraco.DateTime',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}

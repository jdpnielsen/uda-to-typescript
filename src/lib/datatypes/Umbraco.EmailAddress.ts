import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const emailAddressHandler: HandlerConfig = {
	editorAlias: 'Umbraco.EmailAddress',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}

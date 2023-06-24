import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const tinyMCEHandler: HandlerConfig = {
	editorAlias: 'Umbraco.TinyMCE',
	build: () => [],
	reference: () => factory.createTypeLiteralNode([
		factory.createPropertySignature(
			undefined,
			factory.createIdentifier('markup'),
			undefined,
			factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
		)
	]),
}

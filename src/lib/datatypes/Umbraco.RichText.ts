import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const richTextHandler = {
	editorAlias: 'Umbraco.RichText' as const,
	build: () => [],
	reference: () => factory.createTypeLiteralNode([
		factory.createPropertySignature(
			undefined,
			factory.createIdentifier('markup'),
			undefined,
			factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
		)
	]),
} satisfies HandlerConfig

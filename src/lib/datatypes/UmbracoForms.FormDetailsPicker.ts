import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const formDetailsPickerHandler = {
	editorAlias: 'UmbracoForms.FormDetailsPicker' as const,
	build: () => [],
	reference: () => factory.createTypeLiteralNode([
		factory.createPropertySignature(
			undefined,
			factory.createIdentifier('formId'),
			undefined,
			factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
		),
		factory.createPropertySignature(
			undefined,
			factory.createIdentifier('theme'),
			undefined,
			factory.createLiteralTypeNode(factory.createNull())
		),
		factory.createPropertySignature(
			undefined,
			factory.createIdentifier('redirectToPageId'),
			undefined,
			factory.createLiteralTypeNode(factory.createNull())
		),
		factory.createPropertySignature(
			undefined,
			factory.createIdentifier('form'),
			undefined,
			factory.createTypeReferenceNode(
				factory.createIdentifier('UmbracoForm')
			)
		)
	]),
} satisfies HandlerConfig;

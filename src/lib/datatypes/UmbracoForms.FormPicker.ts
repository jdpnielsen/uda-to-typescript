import ts, { factory } from 'typescript';

import type { HandlerConfig } from '.';

export const formsFormPickerHandler = {
	editorAlias: 'UmbracoForms.FormPicker' as const,
	build: () => [],
	reference: (dataType) => {
		const multiple = dataType.EditorUiAlias === 'Forms.PropertyEditorUi.FormPicker.Multiple';

		const formPicker = factory.createTypeLiteralNode([
			factory.createPropertySignature(
				undefined,
				factory.createIdentifier('id'),
				undefined,
				factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
			),
			factory.createPropertySignature(
				undefined,
				factory.createIdentifier('form'),
				undefined,
				factory.createTypeReferenceNode(
					factory.createIdentifier('UmbracoForm'),
				),
			),
		]);

		return multiple
			? factory.createArrayTypeNode(formPicker)
			: formPicker;
	},
} satisfies HandlerConfig;

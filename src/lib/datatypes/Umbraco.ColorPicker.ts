import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';
import { DataType } from '../types/data-type';
import { pascalCase } from 'change-case';
import { createModernEnumHandler } from '../helpers/ast/modern-enum';
import { maybeNull } from '../helpers/ast/maybe-null';

type ColorPickerConfig = {
	useLabel: boolean;
	items: { id: number, value: string }[];
}

type DecodedColorPickerValue = {
	value: string;
	label: string;
}

export const colorPickerHandler: HandlerConfig = {
	editorAlias: 'Umbraco.ColorPicker',
	build,
	reference,
}

export function build(dataType: DataType): ts.Node[] {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = dataType.Configuration as ColorPickerConfig;

	const items = config.items.map((item, index) => {
		const { label, value } = JSON.parse(item.value) as DecodedColorPickerValue;

		return {
			key: label === value ? `Color${index + 1}` : label,
			value,
		};
	});

	return createModernEnumHandler(variableIdentifier, items);
}

export function reference(dataType: DataType): ts.TypeNode {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = dataType.Configuration as ColorPickerConfig;

	const dropDownType = factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier),
		undefined
	);

	if (!config.useLabel) {
		/**
		 * Output:
		 * key: Enum | null;
		 */
		return maybeNull(dropDownType);
	}

	/**
	 * Output:
	 * key: {
	 * 	value: Enum;
	 * 	label: keyof typeof Enum
	 * } | null;
	*/
	return maybeNull(
		factory.createTypeLiteralNode([
			factory.createPropertySignature(
				undefined,
				factory.createIdentifier('value'),
				undefined,
				dropDownType,
			),
			factory.createPropertySignature(
				undefined,
				factory.createIdentifier('label'),
				undefined,
				factory.createTypeOperatorNode(
					ts.SyntaxKind.KeyOfKeyword,
					factory.createTypeQueryNode(
						factory.createIdentifier(variableIdentifier),
						undefined
					)
				)
			),
		])
	);
}

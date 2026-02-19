import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';
import { DataType } from '../types/data-type';
import { pascalCase } from 'change-case';
import { createModernEnumHandler } from '../helpers/ast/modern-enum';
import { maybeNull } from '../helpers/ast/maybe-null';
import { parseBooleanConfigValue } from '../helpers/parse-boolean';

type Item = { label: string; value: string };

export type ColorPickerConfig = {
	useLabel?: boolean | '0' | '1';
	items?: Item[];
}

export const colorPickerHandler = {
	editorAlias: 'Umbraco.ColorPicker' as const,
	build,
	reference,
} satisfies HandlerConfig

export function build(dataType: DataType): ts.Node[] {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = (dataType.Configuration || {}) as Partial<ColorPickerConfig>;
	const items = getItems(config);

	if (items.length === 0) {
		return [];
	}

	const enumItems = items.map((item, index) => {
		const { label, value } = decodeColorPickerValue(item, index);

		return {
			key: label === value ? `Color${index + 1}` : label,
			value,
		};
	});

	return createModernEnumHandler(variableIdentifier, enumItems);
}

export function reference(dataType: DataType): ts.TypeNode {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = (dataType.Configuration || {}) as Partial<ColorPickerConfig>;
	const items = getItems(config);
	const useLabel = parseBooleanConfigValue(config.useLabel) ?? false;

	if (items.length === 0) {
		if (!useLabel) {
			return maybeNull(
				factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
			);
		}

		return maybeNull(
			factory.createTypeLiteralNode([
				factory.createPropertySignature(
					undefined,
					factory.createIdentifier('value'),
					undefined,
					factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
				),
				factory.createPropertySignature(
					undefined,
					factory.createIdentifier('label'),
					undefined,
					factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
				),
			])
		);
	}

	const dropDownType = factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier),
		undefined
	);

	if (!useLabel) {
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

function getItems(config: Partial<ColorPickerConfig>): Item[] {
	if (!Array.isArray(config.items)) {
		return [];
	}

	return config.items
		.filter(item => typeof item.value === 'string');
}

function decodeColorPickerValue({ label, value }: Item, index: number): Item {
	return {
		label: label ? pascalCase(label) : `Color${index + 1}`,
		value: value,
	};
}

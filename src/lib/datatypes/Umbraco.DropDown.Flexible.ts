import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript'

import { DataType } from '../types/data-type';

import type { HandlerConfig } from '.';
import { createModernEnumHandler } from '../helpers/ast/modern-enum';

type DropdownConfig = {
	multiple: boolean,
	items: { id: number, value: string }[]
};

export const dropdownHandler = {
	editorAlias: 'Umbraco.DropDown.Flexible' as const,
	build,
	reference,
} satisfies HandlerConfig

export function build(dataType: DataType): ts.Node[] {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = (dataType.Configuration || {}) as Partial<DropdownConfig>;
	const items = getItems(config);

	if (items.length === 0) {
		return [];
	}

	const enumItems = items.map((item) => {
		return {
			key: pascalCase(item.value),
			value: item.value,
		};
	});

	return createModernEnumHandler(variableIdentifier, enumItems);
}

export function reference(dataType: DataType): ts.TypeNode {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = (dataType.Configuration || {}) as Partial<DropdownConfig>;
	const items = getItems(config);
	const isMultiple = config.multiple === true;

	if (items.length === 0) {
		const fallback = factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);

		if (isMultiple) {
			return factory.createArrayTypeNode(fallback)
		}

		return fallback;
	}

	const dropDownType = factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier),
		undefined
	);

	if (isMultiple) {
		return factory.createArrayTypeNode(dropDownType)
	}

	return dropDownType;
}

function getItems(config: Partial<DropdownConfig>): Array<{ id: number; value: string }> {
	if (!Array.isArray(config.items)) {
		return [];
	}

	return config.items
		.filter((item): item is { id: number; value: string } => typeof item?.value === 'string');
}

import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript';

import type { HandlerConfig } from '.';
import { createModernEnumHandler } from '../helpers/ast/modern-enum';
import { parseBooleanConfigValue } from '../helpers/parse-boolean';
import type { DataType } from '../types/data-type';

/** @deprecated Leftover configuration from Umbraco v13 */
interface Item { id: number; value: string }

export interface DropdownConfig {
	multiple?: boolean | '0' | '1';
	items?: string[] | Item[];
}

export const dropdownHandler = {
	editorAlias: 'Umbraco.DropDown.Flexible' as const,
	build,
	reference,
} satisfies HandlerConfig;

export function build(dataType: DataType): ts.Node[] {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = (dataType.Configuration || {}) as Partial<DropdownConfig>;
	const items = getItems(config);

	if (items.length === 0) {
		return [];
	}

	const enumItems = items.map((item) => {
		return {
			key: pascalCase(item),
			value: item,
		};
	});

	return createModernEnumHandler(variableIdentifier, enumItems);
}

export function reference(dataType: DataType): ts.TypeNode {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = (dataType.Configuration || {}) as Partial<DropdownConfig>;
	const items = getItems(config);
	const isMultiple = parseBooleanConfigValue(config.multiple) ?? false;

	if (items.length === 0) {
		const fallback = factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);

		if (isMultiple) {
			return factory.createArrayTypeNode(fallback);
		}

		return fallback;
	}

	const dropDownType = factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier),
		undefined,
	);

	if (isMultiple) {
		return factory.createArrayTypeNode(dropDownType);
	}

	return dropDownType;
}

function getItems(config: Partial<DropdownConfig>): string[] {
	if (!Array.isArray(config.items)) {
		return [];
	}

	return config.items
		.map((item) => typeof item === 'string' ? item : item?.value)
		.filter((item) => typeof item === 'string');
}

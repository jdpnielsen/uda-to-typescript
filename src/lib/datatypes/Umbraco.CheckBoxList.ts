import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript'

import { DataType } from '../types/data-type';

import type { HandlerConfig } from '.';
import { createModernEnumHandler } from '../helpers/ast/modern-enum';

type CheckboxListConfig = {
	items: { id: number, value: string }[]
};

export const checkboxListHandler = {
	editorAlias: 'Umbraco.CheckBoxList' as const,
	build,
	reference,
} satisfies HandlerConfig;

export function build(dataType: DataType): ts.Node[] {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = (dataType.Configuration || {}) as Partial<CheckboxListConfig>;
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
	const config = (dataType.Configuration || {}) as Partial<CheckboxListConfig>;
	const items = getItems(config);

	if (items.length === 0) {
		return factory.createArrayTypeNode(
			factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
		)
	}

	const checkboxListType = factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier),
		undefined
	);

	return factory.createArrayTypeNode(checkboxListType)
}

function getItems(config: Partial<CheckboxListConfig>): Array<{ id: number; value: string }> {
	if (!Array.isArray(config.items)) {
		return [];
	}

	return config.items
		.filter((item): item is { id: number; value: string } => typeof item?.value === 'string');
}

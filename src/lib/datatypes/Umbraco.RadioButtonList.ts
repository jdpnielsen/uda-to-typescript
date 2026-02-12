import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript'

import { DataType } from '../types/data-type';

import type { HandlerConfig } from '.';
import { createModernEnumHandler } from '../helpers/ast/modern-enum';
import { maybeNull } from '../helpers/ast/maybe-null';

type RadioButtonListConfig = {
	items: { id: number, value: string }[]
};

export const radioButtonListHandler = {
	editorAlias: 'Umbraco.RadioButtonList' as const,
	build,
	reference,
} satisfies HandlerConfig

export function build(dataType: DataType): ts.Node[] {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = (dataType.Configuration || {}) as Partial<RadioButtonListConfig>;
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
	const config = (dataType.Configuration || {}) as Partial<RadioButtonListConfig>;
	const items = getItems(config);

	if (items.length === 0) {
		return maybeNull(
			factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
		);
	}

	return maybeNull(
		factory.createTypeReferenceNode(
			factory.createIdentifier(variableIdentifier),
			undefined
		)
	);
}

function getItems(config: Partial<RadioButtonListConfig>): Array<{ id: number; value: string }> {
	if (!Array.isArray(config.items)) {
		return [];
	}

	return config.items
		.filter((item): item is { id: number; value: string } => typeof item?.value === 'string');
}

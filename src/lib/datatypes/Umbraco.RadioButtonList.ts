import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript';

import type { HandlerConfig } from '.';
import { maybeNull } from '../helpers/ast/maybe-null';
import { createModernEnumHandler } from '../helpers/ast/modern-enum';
import type { DataType } from '../types/data-type';

/** @deprecated Leftover configuration from Umbraco v13 */
interface Item { id: number; value: string }

export interface RadioButtonListConfig {
	items?: string[] | Item[];
}

export const radioButtonListHandler = {
	editorAlias: 'Umbraco.RadioButtonList' as const,
	build,
	reference,
} satisfies HandlerConfig;

export function build(dataType: DataType): ts.Node[] {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = (dataType.Configuration || {}) as Partial<RadioButtonListConfig>;
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
	const config = (dataType.Configuration || {}) as Partial<RadioButtonListConfig>;
	const items = getItems(config);

	if (items.length === 0) {
		return maybeNull(
			factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
		);
	}

	return maybeNull(
		factory.createTypeReferenceNode(
			factory.createIdentifier(variableIdentifier),
			undefined,
		),
	);
}

function getItems(config: Partial<RadioButtonListConfig>): string[] {
	if (!Array.isArray(config.items)) {
		return [];
	}

	return config.items
		.map((item) => typeof item === 'string' ? item : item?.value)
		.filter((item) => typeof item === 'string');
}

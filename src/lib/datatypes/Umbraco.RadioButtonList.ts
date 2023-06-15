import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript'

import { DataType } from '../types/data-type';

import type { HandlerConfig } from '.';
import { createModernEnumHandler } from '../helpers/ast/modern-enum';
import { maybeNull } from '../helpers/ast/maybe-null';

type RadioButtonListConfig = {
	items: { id: number, value: string }[]
};

export const radioButtonListHandler: HandlerConfig = {
	editorAlias: 'Umbraco.RadioButtonList',
	build,
	reference,
}

export function build(dataType: DataType): ts.Node[] {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = dataType.Configuration as RadioButtonListConfig;

	const items = config.items.map((item) => {
		return {
			key: pascalCase(item.value),
			value: item.value,
		};
	});

	return createModernEnumHandler(variableIdentifier, items);
}

export function reference(dataType: DataType): ts.TypeNode {
	const variableIdentifier = pascalCase(dataType.Name);

	return maybeNull(
		factory.createTypeReferenceNode(
			factory.createIdentifier(variableIdentifier),
			undefined
		)
	);
}

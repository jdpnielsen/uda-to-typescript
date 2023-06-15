import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript'

import { DataType } from '../types/data-type';

import type { HandlerConfig } from '.';

type DropdownConfig = {
	multiple: boolean,
	items: {
		key: string,
		value: string
	}[]
};

export const noaDropdownHandler: HandlerConfig = {
	editorAlias: 'NoA.dropdown',
	build,
	reference: reference,
}

function build(dataType: DataType): ts.Node[] {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = dataType.Configuration as DropdownConfig;

	return [
		factory.createVariableStatement(
			undefined,
			factory.createVariableDeclarationList(
				[factory.createVariableDeclaration(
					factory.createIdentifier(variableIdentifier),
					undefined,
					undefined,
					factory.createAsExpression(
						factory.createObjectLiteralExpression(
							config.items.map((item) => factory.createPropertyAssignment(
								factory.createIdentifier(pascalCase(item.key)),
								factory.createStringLiteral(item.value)
							)),
							true
						),
						factory.createTypeReferenceNode(
							factory.createIdentifier('const'),
							undefined
						)
					)
				)],
				ts.NodeFlags.Const
			)
		),
		ts.factory.createIdentifier('\n'),
		factory.createTypeAliasDeclaration(
			undefined,
			factory.createIdentifier(variableIdentifier),
			undefined,
			factory.createIndexedAccessTypeNode(
				factory.createTypeQueryNode(
					factory.createIdentifier(variableIdentifier),
					undefined
				),
				factory.createTypeOperatorNode(
					ts.SyntaxKind.KeyOfKeyword,
					factory.createTypeQueryNode(
						factory.createIdentifier(variableIdentifier),
						undefined
					)
				)
			)
		)
	];
}

function reference(dataType: DataType): ts.TypeNode {
	const variableIdentifier = pascalCase(dataType.Name);
	const config = dataType.Configuration as DropdownConfig;

	const dropDownType = factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier),
		undefined
	);

	if (config.multiple) {
		return factory.createArrayTypeNode(dropDownType)
	}

	return dropDownType;
}

import ts, { factory } from 'typescript';
import { newLineAST } from './newline';
import { exportToken } from './export-token';

/**
 * Creates an immidiate indexed object which acts as an enum, but is actually a plain object.
 * @param name The name of the enum.
 * @param items The entries of the enum.
 * @example
 * ```ts
 * createModernEnumHandler('MyEnum', [
 * 	{ key: 'foo', value: 'bar' },
 * 	{ key: 'baz', value: factory.createStringLiteral('qux') },
 * 	{ key: 'bar', value: factory.createTypeReferenceNode(factory.createIdentifier('OtherType')) },
 * ]);
 * // Output:
 * const MyEnum = {
 * 	foo: 'bar',
 * 	baz: 'qux',
 * 	bar: OtherType,
 * } as const;
 *
 * type MyEnum = (typeof MyEnum)[keyof typeof MyEnum];
 * ```
 *
 */
export function createModernEnumHandler(name: string, items: { key: string, value: ts.Expression | string }[], shouldExport = true): ts.Node[] {
	return [
		factory.createVariableStatement(
			shouldExport
				? [exportToken]
				: undefined,
			factory.createVariableDeclarationList(
				[factory.createVariableDeclaration(
					factory.createIdentifier(name),
					undefined,
					undefined,
					factory.createAsExpression(
						factory.createObjectLiteralExpression(
							items.map((item) => factory.createPropertyAssignment(
								item.key,
								typeof item.value === 'string' ? factory.createStringLiteral(item.value) : item.value,
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
		newLineAST,
		factory.createTypeAliasDeclaration(
			shouldExport
				? [exportToken]
				: undefined,
			factory.createIdentifier(name),
			undefined,
			factory.createIndexedAccessTypeNode(
				factory.createTypeQueryNode(
					factory.createIdentifier(name),
					undefined
				),
				factory.createTypeOperatorNode(
					ts.SyntaxKind.KeyOfKeyword,
					factory.createTypeQueryNode(
						factory.createIdentifier(name),
						undefined
					)
				)
			)
		)
	];
}

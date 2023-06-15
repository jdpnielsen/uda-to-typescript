import ts, { factory } from 'typescript';

/**
 * Creates a union type with the given type and null.
 */
export function maybeNull(value: ts.TypeNode): ts.UnionTypeNode {
	return factory.createUnionTypeNode([
		value,
		factory.createLiteralTypeNode(factory.createNull())
	])
}

import ts from 'typescript';

/**
 * Parses a TypeScript type expression into an AST `TypeNode`.
 *
 * Useful when custom handlers return reference output as strings, for example
 * `"UrlItem"` or `"(Foo | Bar)[]"`.
 */
export function parseTypeNode(input: string): ts.TypeNode {
	const source = ts.createSourceFile(
		'file.ts',
		`type __ParsedType__ = ${input}`,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);

	const statement = source.statements[0];

	if (!statement || !ts.isTypeAliasDeclaration(statement)) {
		throw new Error(`Could not parse type expression: ${input}`);
	}

	return statement.type;
}

import ts from 'typescript';

/**
 * Parses TypeScript source text into top-level AST statements.
 *
 * Used by handlers that return string snippets instead of AST nodes.
 */
export function parseStringStatements(input: string): ts.Node[] {
	const source = ts.createSourceFile(
		'file.ts',
		input,
		ts.ScriptTarget.Latest,
	);

	return Array.from(source.statements);
}

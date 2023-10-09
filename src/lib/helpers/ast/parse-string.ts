import ts from 'typescript';

export function parseStringStatements(input: string): ts.Node[] {
	const source = ts.createSourceFile(
		'file.ts',
		input,
		ts.ScriptTarget.Latest
	);

	return Array.from(source.statements);
}

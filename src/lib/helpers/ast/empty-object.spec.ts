import { emptyObjectAST } from './empty-object';
import ts from 'typescript';

describe('emptyObjectAST', () => {
	it('should create a type reference node with Record and string/never types', () => {
		// Convert to string
		const sourceFile = ts.createSourceFile(
			'file.ts',
			'',
			ts.ScriptTarget.ESNext,
			true,
			ts.ScriptKind.TS
		)

		const printer = ts.createPrinter({});

		const outputFile = printer.printList(
			ts.ListFormat.SingleLine,
			ts.factory.createNodeArray([
				emptyObjectAST,
			]),
			sourceFile,
		);

		expect(outputFile).toEqual('Record<string, never>');
	});
});

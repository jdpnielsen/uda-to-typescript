import ts from 'typescript';
import { parseStringStatements } from './parse-string';

describe('parseStringStatements', () => {
	it('should parse a union of string literals', () => {
		// eslint-disable-next-line quotes
		const input = `type Statement = "key" | "val"`
		const nodeArray = parseStringStatements(input);

		const output = ts.createPrinter({
			omitTrailingSemicolon: true,
		})
			.printList(
				ts.ListFormat.SingleLine,
				ts.factory.createNodeArray(nodeArray),
				ts.createSourceFile('test.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
			);

		expect(output).toBe(input);
	});

	it('should not change simple input value', () => {
		// eslint-disable-next-line quotes
		const input = `val`
		const nodeArray = parseStringStatements(input);

		const output = ts.createPrinter({ omitTrailingSemicolon: true })
			.printList(
				ts.ListFormat.SingleLine,
				ts.factory.createNodeArray(nodeArray),
				ts.createSourceFile('test.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
			);

		expect(output).toBe(input);
	});
});

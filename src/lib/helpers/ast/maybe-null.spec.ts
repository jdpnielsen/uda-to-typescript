import { maybeNull } from './maybe-null';
import ts from 'typescript';

describe('maybeNull', () => {
	it('should create a union type with the given type and null', () => {
		const type = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
		const value = maybeNull(type);

		const expected = ts.createPrinter()
			.printNode(
				ts.EmitHint.Unspecified,
				value,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest)
			);

		expect(expected).toEqual('string | null');
	});
});

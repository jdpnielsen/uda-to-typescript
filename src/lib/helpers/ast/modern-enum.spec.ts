import ts from 'typescript';
import { createModernEnumHandler } from './modern-enum';

describe('createModernEnumHandler', () => {
	it('should create an immediate indexed object that acts as an enum', () => {
		const items = [
			{ key: 'foo', value: 'bar' },
			{ key: 'baz', value: ts.factory.createStringLiteral('qux') },
		];
		const nodes = createModernEnumHandler('MyEnum', items);
		const printer = ts.createPrinter();
		const result = nodes
			.map(node => printer.printNode(
				ts.EmitHint.Unspecified,
				node,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest))).join('');

		expect(result).toEqual(`export const MyEnum = {
    foo: "bar",
    baz: "qux"
} as const;
export type MyEnum = (typeof MyEnum)[keyof typeof MyEnum];`);
	});
});

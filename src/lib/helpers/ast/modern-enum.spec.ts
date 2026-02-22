import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { printType } from '../test';
import { createModernEnumHandler } from './modern-enum';

describe('createModernEnumHandler', () => {
	it('should create an immediate indexed object that acts as an enum', () => {
		const items = [
			{ key: 'foo', value: 'bar' },
			{ key: 'baz', value: ts.factory.createStringLiteral('qux') },
		];

		const nodes = createModernEnumHandler('MyEnum', items);
		const result = printType(nodes);

		expect(result).toMatchInlineSnapshot(`
			"export const MyEnum = {
			    foo: "bar",
			    baz: "qux"
			} as const;
			export type MyEnum = (typeof MyEnum)[keyof typeof MyEnum];
			"
		`);
	});
});

import { describe, expect, it } from 'vitest';

import { createDataType, printType } from '../helpers/test';
import { checkboxListHandler } from './Umbraco.CheckBoxList';
import type { CheckboxListConfig } from './Umbraco.CheckBoxList';

describe('umbraco.CheckBoxList', () => {
	describe('legacy data format', () => {
		it('should handle build and reference enum', () => {
			const dataType = createDataType<CheckboxListConfig>('Umbraco.CheckBoxList', {
				items: [
					{ id: 1, value: 'Value 1' },
					{ id: 2, value: 'Value 2' },
					{ id: 3, value: 'Value 3' },
				],
			});

			const buildValue = checkboxListHandler.build(dataType);
			expect(printType(buildValue)).toMatchInlineSnapshot(`
				"export const Test = {
				    Value_1: "Value 1",
				    Value_2: "Value 2",
				    Value_3: "Value 3"
				} as const;
				export type Test = (typeof Test)[keyof typeof Test];
				"
			`);

			const reference = checkboxListHandler.reference(dataType);
			expect(printType(reference)).toBe('Test[]');
		});

		it('should handle missing items', () => {
			const datatype = createDataType<CheckboxListConfig>('Umbraco.CheckBoxList', {
			});

			const buildValue = checkboxListHandler.build(datatype);
			expect(printType(buildValue)).toBe('');

			const value = checkboxListHandler.reference(datatype);
			expect(printType(value)).toBe('string[]');
		});
	});

	describe('modern data format', () => {
		it('should handle build and reference enum', () => {
			const datatype = createDataType<CheckboxListConfig>('Umbraco.CheckBoxList', {
				items: [
					'Value 1',
					'Value 2',
					'Value 3',
				],
			});

			const buildValue = checkboxListHandler.build(datatype);
			expect(printType(buildValue)).toMatchInlineSnapshot(`
				"export const Test = {
				    Value_1: "Value 1",
				    Value_2: "Value 2",
				    Value_3: "Value 3"
				} as const;
				export type Test = (typeof Test)[keyof typeof Test];
				"
			`);

			const value = checkboxListHandler.reference(datatype);
			expect(printType(value)).toBe('Test[]');
		});

		it('should handle missing items', () => {
			const datatype = createDataType<CheckboxListConfig>('Umbraco.CheckBoxList', {
			});

			const buildValue = checkboxListHandler.build(datatype);
			expect(printType(buildValue)).toMatchInlineSnapshot('""');

			const value = checkboxListHandler.reference(datatype);
			expect(printType(value)).toBe('string[]');
		});
	});
});

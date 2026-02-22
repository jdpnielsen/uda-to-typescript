import { describe, expect, it } from 'vitest';

import { createDataType, printType } from '../helpers/test';
import { radioButtonListHandler } from './Umbraco.RadioButtonList';
import type { RadioButtonListConfig } from './Umbraco.RadioButtonList';

describe('umbraco.RadioButtonList', () => {
	describe('legacy data format', () => {
		it('should handle build and reference enum', () => {
			const dataType = createDataType<RadioButtonListConfig>('Umbraco.RadioButtonList', {
				items: [
					{ id: 1, value: 'Value 1' },
					{ id: 2, value: 'Value 2' },
					{ id: 3, value: 'Value 3' },
				],
			});

			const buildValue = radioButtonListHandler.build(dataType);
			expect(printType(buildValue)).toMatchInlineSnapshot(`
				"export const Test = {
				    Value_1: "Value 1",
				    Value_2: "Value 2",
				    Value_3: "Value 3"
				} as const;
				export type Test = (typeof Test)[keyof typeof Test];
				"
			`);

			const reference = radioButtonListHandler.reference(dataType);
			expect(printType(reference)).toBe('Test | null');
		});

		it('should handle missing items', () => {
			const datatype = createDataType<RadioButtonListConfig>('Umbraco.RadioButtonList', {
			});

			const buildValue = radioButtonListHandler.build(datatype);
			expect(printType(buildValue)).toBe('');

			const value = radioButtonListHandler.reference(datatype);
			expect(printType(value)).toBe('string | null');
		});
	});

	describe('modern data format', () => {
		it('should handle build and reference enum', () => {
			const datatype = createDataType<RadioButtonListConfig>('Umbraco.RadioButtonList', {
				items: [
					'Value 1',
					'Value 2',
					'Value 3',
				],
			});

			const buildValue = radioButtonListHandler.build(datatype);
			expect(printType(buildValue)).toMatchInlineSnapshot(`
				"export const Test = {
				    Value_1: "Value 1",
				    Value_2: "Value 2",
				    Value_3: "Value 3"
				} as const;
				export type Test = (typeof Test)[keyof typeof Test];
				"
			`);

			const value = radioButtonListHandler.reference(datatype);
			expect(printType(value)).toBe('Test | null');
		});

		it('should handle missing items', () => {
			const datatype = createDataType<RadioButtonListConfig>('Umbraco.RadioButtonList', {
			});

			const buildValue = radioButtonListHandler.build(datatype);
			expect(printType(buildValue)).toMatchInlineSnapshot('""');

			const value = radioButtonListHandler.reference(datatype);
			expect(printType(value)).toBe('string | null');
		});
	});
});

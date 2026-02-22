import { describe, expect, it } from 'vitest';

import { createDataType, printType } from '../helpers/test';
import { colorPickerHandler } from './Umbraco.ColorPicker';
import type { ColorPickerConfig } from './Umbraco.ColorPicker';

describe('umbraco.ColorPicker', () => {
	it('should handle build and reference enum', () => {
		const dataType = createDataType<ColorPickerConfig>('Umbraco.CheckBoxList', {
			items: [
				{
					value: 'e90707',
					label: 'Red',
				},
				{
					value: '2157d4',
					label: 'Blue',
				},
			],
		});

		const buildValue = colorPickerHandler.build(dataType);
		expect(printType(buildValue)).toMatchInlineSnapshot(`
			"export const Test = {
			    Red: "e90707",
			    Blue: "2157d4"
			} as const;
			export type Test = (typeof Test)[keyof typeof Test];
			"
		`);

		const reference = colorPickerHandler.reference(dataType);
		expect(printType(reference)).toMatchInlineSnapshot('"Test | null"');
	});

	it('should use label', () => {
		const dataType = createDataType<ColorPickerConfig>('Umbraco.CheckBoxList', {
			useLabel: true,
			items: [
				{
					value: 'e90707',
					label: 'Red',
				},
				{
					value: '2157d4',
					label: 'Blue',
				},
			],
		});

		const buildValue = colorPickerHandler.build(dataType);
		expect(printType(buildValue)).toMatchInlineSnapshot(`
			"export const Test = {
			    Red: "e90707",
			    Blue: "2157d4"
			} as const;
			export type Test = (typeof Test)[keyof typeof Test];
			"
		`);

		const reference = colorPickerHandler.reference(dataType);
		expect(printType(reference)).toMatchInlineSnapshot(`
"{
    value: Test;
    label: keyof typeof Test;
} | null"
`);
	});

	it('should handle missing items', () => {
		const datatype = createDataType<ColorPickerConfig>('Umbraco.CheckBoxList', {
		});

		const buildValue = colorPickerHandler.build(datatype);
		expect(printType(buildValue)).toBe('');

		const value = colorPickerHandler.reference(datatype);
		expect(printType(value)).toBe('string | null');
	});
});

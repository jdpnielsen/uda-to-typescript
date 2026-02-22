import ts from 'typescript';

import { colorPickerHandler } from './Umbraco.ColorPicker';
import { dropdownHandler } from './Umbraco.DropDown.Flexible';
import { sliderHandler } from './Umbraco.Slider';
import type { DataType } from '../types/data-type';

describe('boolean-like datatype config values', () => {
	describe('dropdownHandler.reference', () => {
		it('should treat string "1" as true', () => {
			const value = dropdownHandler.reference(createDataType('Umbraco.DropDown.Flexible', {
				multiple: '1',
			}));

			expect(printType(value)).toBe('string[]');
		});

		it('should treat string "0" as false', () => {
			const value = dropdownHandler.reference(createDataType('Umbraco.DropDown.Flexible', {
				multiple: '0',
			}));

			expect(printType(value)).toBe('string');
		});

		it('should preserve boolean true behavior', () => {
			const value = dropdownHandler.reference(createDataType('Umbraco.DropDown.Flexible', {
				multiple: true,
			}));

			expect(printType(value)).toBe('string[]');
		});
	});

	describe('colorPickerHandler.reference', () => {
		it('should treat string "1" as true', () => {
			const value = colorPickerHandler.reference(createDataType('Umbraco.ColorPicker', {
				useLabel: '1',
			}));

			const output = printType(value);
			expect(output).toContain('value: string;');
			expect(output).toContain('label: string;');
			expect(output).toContain('| null');
		});

		it('should treat string "0" as false', () => {
			const value = colorPickerHandler.reference(createDataType('Umbraco.ColorPicker', {
				useLabel: '0',
			}));

			expect(printType(value)).toBe('string | null');
		});

		it('should preserve boolean true behavior', () => {
			const value = colorPickerHandler.reference(createDataType('Umbraco.ColorPicker', {
				useLabel: true,
			}));

			const output = printType(value);
			expect(output).toContain('value: string;');
			expect(output).toContain('label: string;');
			expect(output).toContain('| null');
		});
	});

	describe('sliderHandler.reference', () => {
		it('should treat string "1" as true', () => {
			const value = sliderHandler.reference(createDataType('Umbraco.Slider', {
				enableRange: '1',
			}));

			const output = printType(value);
			expect(output).toContain('"minimum": number;');
			expect(output).toContain('"maximum": number;');
		});

		it('should treat string "0" as false', () => {
			const value = sliderHandler.reference(createDataType('Umbraco.Slider', {
				enableRange: '0',
			}));

			expect(printType(value)).toBe('number');
		});

		it('should preserve boolean true behavior', () => {
			const value = sliderHandler.reference(createDataType('Umbraco.Slider', {
				enableRange: true,
			}));

			const output = printType(value);
			expect(output).toContain('"minimum": number;');
			expect(output).toContain('"maximum": number;');
		});
	});
});

function createDataType(editorAlias: string, configuration: Record<string, unknown>): DataType {
	return {
		Name: 'Test',
		EditorAlias: editorAlias,
		Configuration: configuration,
		Udi: 'umb://data-type/test',
		Dependencies: [],
		__type: 'Umbraco.Deploy.Infrastructure,Umbraco.Deploy.Infrastructure.Artifacts.DataTypeArtifact',
		__version: '17.0.1',
	};
}

function printType(typeNode: ts.TypeNode): string {
	return ts.createPrinter()
		.printNode(
			ts.EmitHint.Unspecified,
			typeNode,
			ts.createSourceFile('', '', ts.ScriptTarget.Latest)
		);
}

import { describe, expect, it } from 'vitest';

import type { UDAConvertConfiguration } from './define-config';
import { defineConfig } from './define-config';

describe('defineConfig', () => {
	it('should return the same configuration object', () => {
		const config = {
			input: './file/*.uda',
			output: './output.ts',
		} satisfies UDAConvertConfiguration;

		expect(defineConfig(config)).toBe(config);
	});

	it('should allow toggling data type alias emission', () => {
		const config = {
			input: './file/*.uda',
			output: './output.ts',
			emitDataTypeAliases: false,
		} satisfies UDAConvertConfiguration;

		expect(defineConfig(config)).toBe(config);
	});
});

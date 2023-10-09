import { defineConfig, UDAConvertConfiguration } from './define-config';

describe('defineConfig', () => {
	it('should return the same configuration object', () => {
		const config = {
			input: './file/*.uda',
			output: './output.ts',
		} satisfies UDAConvertConfiguration;

		expect(defineConfig(config)).toBe(config);
	});
});

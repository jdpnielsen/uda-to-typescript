import { defineConfig } from 'tsdown';

export default defineConfig({
	exports: true,
	entry: ['./src/index.ts', './src/cli.ts'],
	format: {
		esm: {
			target: ['esnext'],
		},
		cjs: {
			target: ['node20'],
		},
	},
	dts: {
		sourcemap: true,
	},
	report: true,
	publint: true,
	attw: {
		profile: 'node16',
	},
});

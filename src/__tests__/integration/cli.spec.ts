import execa from 'execa';
import { rm, stat, readFile } from 'fs/promises';
import { resolve } from 'path';
import { version } from '../../../package.json';

const bin = resolve(__dirname, './bin.js');

describe('uda-to-typescript', () => {
	it('should display the help contents', async () => {
		const { stdout } = await execa(bin, ['--help']);

		expect(stdout).toContain('Usage: uda-to-typescript [options]');
	});

	it('should display version information', async () => {
		const { stdout } = await execa(bin, ['--version']);

		expect(stdout).toContain(version);
	});

	it('should output types', async () => {
		await rm('./dist/v13', { recursive: true, force: true });

		await execa(bin, ['--input', './src/__tests__/__fixtures__/v13/*.uda', '--output', './dist/v13/output.ts']);

		const val = await stat('./dist/v13/output.ts');
		expect(val.isFile()).toBeTruthy();
	});

	it('should output types for v17 fixtures', async () => {
		await rm('./dist/v17', { recursive: true, force: true });

		await execa(bin, ['--input', './src/__tests__/__fixtures__/v17/*.uda', '--output', './dist/v17/output.ts']);

		const val = await stat('./dist/v17/output.ts');
		expect(val.isFile()).toBeTruthy();
	});

	it('should resolve custom handlers by EditorUiAlias from config', async () => {
		await rm('./dist/v17/custom-handler-output.ts', { force: true });

		await execa(bin, ['--config', './src/__tests__/__fixtures__/v17/udaconvert.custom-handler.config.ts']);

		const val = await stat('./dist/v17/custom-handler-output.ts');
		expect(val.isFile()).toBeTruthy();

		const output = await readFile('./dist/v17/custom-handler-output.ts', 'utf8');
		expect(output).toContain('link: UrlItem;');
		expect(output).not.toContain('link: unknown;');
	});
});

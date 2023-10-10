import execa from 'execa';
import { rm, stat } from 'fs/promises';
import { resolve } from 'path';
import { version } from '../../../package.json';

const bin = resolve(__dirname, './bin.js');

describe('uda-to-typescript', () => {
	beforeEach(async () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		await rm('./dist', { recursive: true }).catch(() => {});
	});

	it('should display the help contents', async () => {
		const { stdout } = await execa(bin, ['--help']);

		expect(stdout).toContain('Usage: uda-to-typescript [options]');
	});

	it('should display version information', async () => {
		const { stdout } = await execa(bin, ['--version']);

		expect(stdout).toContain(version);
	});

	it('should output types', async () => {
		await execa(bin, ['--input', './src/__tests__/__fixtures__/*.uda', '--output', './dist/output.ts']);

		const val = await stat('./dist/output.ts');
		expect(val.isFile()).toBeTruthy();
	});
});

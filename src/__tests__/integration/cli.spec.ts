import execa from 'execa';
import { stat, unlink } from 'fs/promises';
import { resolve } from 'path';
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const version = require('../../../package.json').version;

const bin = resolve(__dirname, './bin.js');

describe('uda-to-typescript', () => {
	beforeEach(async () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		await unlink('./src/__tests__/__fixtures__/output.ts').catch(() => {});
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
		await execa(bin, ['--input', './files/*.uda', '--output', './src/__tests__/__fixtures__/output.ts']);
		const val = await stat('./src/__tests__/__fixtures__/output.ts');
		expect(val).toBeDefined();
	});
});

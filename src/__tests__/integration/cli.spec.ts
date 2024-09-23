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

	it('should output files', async () => {
		await execa(bin, ['--input', './src/__tests__/__fixtures__/*.uda', '--output', './dist/output.ts']);

		const outputFile = await stat('./dist/output.ts');
		expect(outputFile.isFile()).toBeTruthy();

		const baseTypesFile = await stat('./dist/base-types.ts');
		expect(baseTypesFile.isFile()).toBeTruthy();

		const fetcherFile = await stat('./dist/fetcher.ts');
		expect(fetcherFile.isFile()).toBeTruthy();

		const utilsFile = await stat('./dist/utils.ts');
		expect(utilsFile.isFile()).toBeTruthy();
	});

	it('should not include templates if so configured', async () => {
		expect.assertions(4)

		await execa(bin, ['--input', './src/__tests__/__fixtures__/*.uda', '--output', './dist/output.ts', '--templates', 'false']);

		const outputFile = await stat('./dist/output.ts');
		expect(outputFile.isFile()).toBeTruthy();

		try {
			await stat('./dist/base-types.ts');
		} catch (error) {
			expect((error as Error & { code: string }).code).toBe('ENOENT');
		}


		try {
			await stat('./dist/fetcher.ts');
		} catch (error) {
			expect((error as Error & { code: string }).code).toBe('ENOENT');
		}


		try {
			await stat('./dist/utils.ts');
		} catch (error) {
			expect((error as Error & { code: string }).code).toBe('ENOENT');
		}
	});
});

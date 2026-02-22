import { readFile, rm, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { execa } from 'execa';
import { describe, expect, it } from 'vitest';

import { version } from '../../../package.json';

const bin = resolve(dirname(fileURLToPath(import.meta.url)), './bin.cjs');

describe('uda-to-typescript', () => {
	it('should display the help contents', async () => {
		const { stdout } = await execa(bin, ['--help']);

		expect(stdout).toContain('Usage: uda-to-typescript [options]');
	});

	it('should display version information', async () => {
		const { stdout } = await execa(bin, ['--version']);

		expect(stdout).toContain(version);
	});

	it('should output types for current fixtures', async () => {
		await rm('./dist/current', { recursive: true, force: true });

		await execa(bin, ['--input', './src/__tests__/__fixtures__/current/*.uda', '--output', './dist/current/output.ts']);

		const output = await stat('./dist/current/output.ts');
		expect(output.isFile()).toBeTruthy();

		const fetcher = await stat('./dist/current/fetcher.ts');
		expect(fetcher.isFile()).toBeTruthy();

		const outputSource = await readFile('./dist/current/output.ts', 'utf8');
		expect(outputSource).toContain('export type ApprovedColor = string | null;');
	});

	it('should not include templates if so configured', async () => {
		await rm('./dist/current', { recursive: true, force: true });

		expect.assertions(4);

		await execa(bin, ['--input', './src/__tests__/__fixtures__/*.uda', '--output', './dist/output.ts', '--skip-templates']);

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

	it('should resolve custom handlers by EditorUiAlias from config', async () => {
		await rm('./dist/current/custom-handler-output.ts', { force: true });

		await execa(bin, ['--config', './src/__tests__/__fixtures__/current/udaconvert.custom-handler.config.ts']);

		const val = await stat('./dist/current/custom-handler-output.ts');
		expect(val.isFile()).toBeTruthy();

		const output = await readFile('./dist/current/custom-handler-output.ts', 'utf8');
		expect(output).toContain('link: UrlItem;');
		expect(output).not.toContain('link: unknown;');
	});
});

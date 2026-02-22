/* eslint-disable no-console */
import type { PathLike } from 'node:fs';
import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { buildTypes } from './build-types';
import { dataTypeMap } from './datatypes';
import type { UDAConvertConfiguration } from './define-config';
import { collectArtifacts } from './helpers/collect-artifacts';

/**
 * Executes the full conversion pipeline from UDA artifacts to TypeScript output.
 *
 * Steps:
 * 1. Resolve input/output paths from the provided working directory.
 * 2. Collect artifacts from disk.
 * 3. Build AST declarations for all supported artifacts.
 * 4. Copy runtime template helpers.
 * 5. Print and write the generated output file.
 */
export async function main(options: UDAConvertConfiguration, workingDirectory = cwd()): Promise<void> {
	const {
		input,
		output,
		dataTypes = dataTypeMap,
		emitDataTypeAliases = true,
		skipTemplates,
	} = options;

	const resolvedOutput = path.resolve(workingDirectory, output);
	const resolvedInput = path.resolve(workingDirectory, input);

	const { dir, name } = path.parse(resolvedOutput);

	await mkdir(dir, { recursive: true });

	const artifacts = await collectArtifacts(resolvedInput);

	const nodes = buildTypes({
		artifacts,
		dataTypeHandlers: dataTypes,
		emitDataTypeAliases,
	});

	const sourceFile = ts.createSourceFile(
		output,
		name,
		ts.ScriptTarget.ESNext,
		true,
		ts.ScriptKind.TS,
	);

	const printer = ts.createPrinter({
		omitTrailingSemicolon: true,
	});

	if (!skipTemplates) {
		await cloneTemplates(path.resolve(dirname(fileURLToPath(import.meta.url)), '../templates'), dir);
	}

	const outputFile = printer.printList(
		ts.ListFormat.MultiLine,
		nodes,
		sourceFile,
	);

	console.log('Writing types to ', resolvedOutput);
	await writeFile(resolvedOutput, outputFile);
}

/**
 * Copies package templates into the output directory.
 *
 * Only `.ts` implementation files are copied. Declaration files are skipped.
 */
async function cloneTemplates(source: PathLike, destination: PathLike) {
	const templates = await readdir(source);

	for (const templateFile of templates) {
		const templateSource = path.resolve(source.toString(), templateFile);
		const templateDestination = path.resolve(destination.toString(), templateFile);

		if (templateFile.endsWith('.ts') && !templateFile.endsWith('.d.ts')) {
			console.log('Copying', templateSource, 'to', templateDestination);

			// TODO: support template syntax (ejs? handlebars?)
			await copyFile(templateSource, templateDestination);
		}
	}
}

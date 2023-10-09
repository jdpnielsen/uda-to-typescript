import { writeFile, copyFile, readdir, stat, mkdir } from 'fs/promises';
import { collectArtifacts } from './helpers/collect-artifacts';
import { buildTypes } from './build-types';
import ts from 'typescript';
import path from 'path';
import { PathLike } from 'fs';
import { UDAConvertConfiguration } from './define-config';
import { dataTypeMap } from './datatypes';
import { cwd } from 'process';

export async function main(options: UDAConvertConfiguration, workingDirectory = cwd()): Promise<void> {
	const {
		input,
		output,
		dataTypes = dataTypeMap
	} = options;

	const resolvedOutput = path.resolve(workingDirectory, output);
	const resolvedInput = path.resolve(workingDirectory, input);

	const { dir, name } = path.parse(resolvedOutput);

	// Check if folder exists & create if possible.
	// If we are missing multiple levels, the script will still fail
	await stat(dir)
		.catch(() => mkdir(dir));

	const artifacts = await collectArtifacts(resolvedInput);

	const nodes = buildTypes({ artifacts, dataTypeHandlers: dataTypes });

	const sourceFile = ts.createSourceFile(
		output,
		name,
		ts.ScriptTarget.ESNext,
		true,
		ts.ScriptKind.TS
	)

	const printer = ts.createPrinter({})

	// TODO: support custom templates
	await cloneTemplates(path.resolve(__dirname, 'templates'), dir);

	const outputFile = printer.printList(
		ts.ListFormat.MultiLine,
		nodes,
		sourceFile,
	);

	await writeFile(resolvedOutput, outputFile);
}

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

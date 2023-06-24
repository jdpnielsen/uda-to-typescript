import { writeFile, copyFile, readdir } from 'fs/promises';
import { collectArtifacts } from './helpers/collect-artifacts';
import { buildTypes } from './build-types';
import ts from 'typescript';
import path from 'path';
import { PathLike } from 'fs';

export interface CliOptions {
	/** Input glob */
	input: string;

	/** Output file */
	output: string;
}

export async function main(options: CliOptions): Promise<void> {
	const { input, output } = options;

	const { dir, name } = path.parse(output);

	const fileDict = await collectArtifacts(input);
	const nodes = buildTypes(fileDict);

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

	await writeFile(output, outputFile);
}

async function cloneTemplates(source: PathLike, destination: PathLike) {
	const templates = await readdir(source);

	for (const templateFile of templates) {
		const templateSource = path.resolve(source.toString(), templateFile);
		const templateDestination = path.resolve(destination.toString(), templateFile);

		console.log('Copying', templateSource, 'to', templateDestination);

		// TODO: support template syntax (ejs? handlebars?)
		await copyFile(templateSource, templateDestination);
	}
}
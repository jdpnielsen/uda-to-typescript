import { writeFile } from 'fs/promises';
import { collectArtifacts } from './helpers/collect-artifacts';
import { buildTypes } from './build-types';
import ts from 'typescript';

export interface CliOptions {
	/** Input glob */
	input: string;

	/** Output file */
	output: string;
}

export async function main(options: CliOptions): Promise<void> {
	const { input, output } = options;

	const fileDict = await collectArtifacts(input);
	const nodes = buildTypes(fileDict);

	const sourceFile = ts.createSourceFile(
		output,
		'',
		ts.ScriptTarget.ESNext,
		true,
		ts.ScriptKind.TS
	)

	const printer = ts.createPrinter({})
	const outputFile = printer.printList(
		ts.ListFormat.MultiLine,
		nodes,
		sourceFile,
	);

	await writeFile(output, outputFile);
}

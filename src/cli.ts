import { Command } from 'commander';

import { version } from '../package.json';
import { main } from './lib/main';
import { dataTypeMap } from './lib/datatypes';

const program = new Command();

program
	.version(version)
	.name('uda-to-typescript')
	.description('CLI to convert Umbraco UDA files to typescript definitions')
	.option('-i, --input <string>', 'Glob pattern to match. Example: --input ./files/*.uda')
	.option('-o, --output <string>', 'Where to write output file. Example: --output ./file.ts')
	.option('-d, --debug', 'enables verbose logging', false)
	.parse(process.argv);

// Function code for CLI goes here
const opts = program.opts() as {
	/** Input glob */
	input: string;

	/** Output file */
	output: string;
};

main({ ...opts, dataTypes: dataTypeMap })
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});


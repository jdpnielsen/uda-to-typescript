import { Command } from 'commander';

import { version } from '../package.json';
import { CliOptions, main } from './lib/main';

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
const opts = program.opts() as CliOptions;

main(opts)
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});


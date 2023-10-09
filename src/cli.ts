import { Command } from 'commander';
import { cosmiconfigSync } from 'cosmiconfig';

import { version } from '../package.json';
import { main } from './lib/main';
import { UDAConvertConfiguration } from './lib/define-config';
import { cwd } from 'process';
import path from 'path';

const program = new Command();

program
	.version(version)
	.name('uda-to-typescript')
	.description('CLI to convert Umbraco UDA files to typescript definitions')
	.option('-c, --config <string>', 'Path for config file. Example: --config ./udaconvert.config.ts')
	.option('-i, --input <string>', 'Glob pattern to match. Example: --input ./files/*.uda')
	.option('-o, --output <string>', 'Where to write output file. Example: --output ./file.ts')
	.option('-d, --debug', 'enables verbose logging', false)
	.parse(process.argv);

// Function code for CLI goes here
const opts = program.opts() as {
	debug: boolean;

	/** Input glob */
	input: string;

	/** Output file */
	output: string;

	config?: string;
};

const explorerSync = cosmiconfigSync('udaconvert')

const searchedFor = opts.config
	? explorerSync.load(opts.config)
	: explorerSync.search();

const executeFrom = searchedFor
	? path.resolve(path.parse(searchedFor.filepath).dir)
	: cwd();

// Combine configuration from cli & cosmic config
const configuration: UDAConvertConfiguration = {
	...(searchedFor?.config || {}) as UDAConvertConfiguration,
	...opts,
};

// Validate configuration
if (!configuration.input) {
	throw new Error('Required "input" parameter not recieved');
}

if (!configuration.output) {
	throw new Error('Required "output" parameter not recieved');
}

main({ ...configuration }, executeFrom)
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});


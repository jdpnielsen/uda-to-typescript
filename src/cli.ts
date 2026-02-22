#!/usr/bin/env node
import path from 'node:path';
import { argv, cwd, exit } from 'node:process';

import { Command } from 'commander';
import { cosmiconfig } from 'cosmiconfig';

import type { UDAConvertConfiguration } from './lib/define-config';
import { main } from './lib/main';

const program = new Command();

program
	.version('1.0.0')
	.name('uda-to-typescript')
	.description('CLI to convert Umbraco UDA files to typescript definitions')
	.option('-c, --config <string>', 'Path for config file. Example: --config ./udaconvert.config.ts')
	.option('-i, --input <string>', 'Glob pattern to match. Example: --input ./files/*.uda')
	.option('-o, --output <string>', 'Where to write output file. Example: --output ./file.ts')
	.option('--skip-templates', 'Prevent writing of template files. Example: --skip-templates')
	.option('-d, --debug', 'enables verbose logging', false)
	.parse(argv);

// Function code for CLI goes here
const opts = program.opts() as {
	debug: boolean;

	/** Input glob */
	input: string;

	/** Output file */
	output: string;

	skipTemplates: boolean;

	config?: string;
};

const explorerSync = cosmiconfig('udaconvert');

async function run() {
	const searchedFor = opts.config
		? explorerSync.load(opts.config)
		: explorerSync.search();

	const configResult = await searchedFor;
	const executeFrom = configResult
		? path.resolve(path.parse(configResult.filepath).dir)
		: cwd();

	// Combine configuration from cli & cosmic config
	const configuration: UDAConvertConfiguration = {
		...(configResult?.config || {}) as UDAConvertConfiguration,
		...opts,
	};

	// Validate configuration
	if (!configuration.input) {
		throw new Error('Required "input" parameter not received');
	}

	if (!configuration.output) {
		throw new Error('Required "output" parameter not received');
	}

	await main({ ...configuration }, executeFrom);
}

run()
	.catch((err) => {
		console.error(err);
		exit(1);
	});

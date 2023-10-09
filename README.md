# uda-to-typescript

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> Command-line tool to convert Umbraco UDA files to Typescript types.

## Install

```bash
npm install @jdpnielsen/uda-to-typescript
```

## Quick Start

```bash
Usage: uda-to-typescript [options]

CLI to convert Umbraco UDA files to typescript definitions

Options:
  -V, --version          output the version number
  -c, --config <string>  Path for config file. Example: --config ./udaconvert.config.ts
  -i, --input <string>   Glob pattern to match. Example: --input ./files/*.uda
  -o, --output <string>  Where to write output file. Example: --output ./file.ts
  -d, --debug            enables verbose logging (default: false)
  -h, --help             display help for command

Examples:

  $ uda-to-typescript --version
  1.0.0
```

### Without config

```bash
  $ uda-to-typescript --input ../umbraco-boilerplate/src/UmbracoProject/umbraco/Deploy/Revision/*.uda --output ./umbraco-sdk/types.ts
```

### With config

```bash
 $ uda-to-typescript --config ./udaconvert.config.js
 # or
 $ uda-to-typescript
```

**File udaconvert.config.ts**

```js
import { defineConfig } from '@jdpnielsen/uda-to-typescript';

export default defineConfig({
  input: './petstore.yaml',
  output: './src/petstore.ts',
});
```

**File udaconvert.config.js**

```ts
const { defineConfig } = require('@jdpnielsen/uda-to-typescript');

module.exports = defineConfig({
  input: './petstore.yaml',
  output: './src/petstore.ts',
});
```

## Provide custom datatypes

```js
import { factory } from 'typescript';
import { defineConfig, dataTypes, HandlerConfig } from '@jdpnielsen/uda-to-typescript';

export default defineConfig({
	input: '../umbraco-boilerplate/src/UmbracoProject/umbraco/Deploy/Revision/*.uda',
	output: './src/umbraco/output.ts',
	dataTypes: {
		...dataTypes, // Provide default types
		'Custom.StatementEditor': {
			editorAlias: 'Custom.StatementEditor',
			/**
			 * Used to create any shared setup for the propertyEditor
			 */
			init: () => {
				return 'export type Statement = "key" | "val";';
			},
			/**
			 * Used to generate any dataType specifc types
			 * @example ```ts
			 * type MetatitleTextboxType = {
			 * 	statement: Statement;
			 * 	prop: string;
			 * };
			 * ```
			 */
			build: (dataType) => {
				return `type ${pascalCase(dataType.Name)}Type = {
					statement: Statement;
					prop: ${dataType.DatabaseType === 1 ? 'string' : 'unknown'};
				}`;
			},
			/**
			 * Used to generate any usage specific type/reference
			 * @example ```ts
			 * export type Metadata = BaseDocumentType<'metadata', {
			 * 	meta_title?: MetatitleTextboxType;
			 * }>;
			 * ```
			 */
			reference: (dataType) => `${pascalCase(dataType.Name)}Type`,
		},
	},
});
```


[build-img]:https://github.com/jdpnielsen/uda-to-typescript/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/jdpnielsen/uda-to-typescript/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/uda-to-typescript
[downloads-url]:https://www.npmtrends.com/uda-to-typescript
[npm-img]:https://img.shields.io/npm/v/uda-to-typescript
[npm-url]:https://www.npmjs.com/package/uda-to-typescript
[issues-img]:https://img.shields.io/github/issues/jdpnielsen/uda-to-typescript
[issues-url]:https://github.com/jdpnielsen/uda-to-typescript/issues
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/

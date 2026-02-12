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
  $ uda-to-typescript --input ../your-umbraco-project/src/UmbracoProject/umbraco/Deploy/Revision/*.uda --output ./umbraco-sdk/types.ts
```

### With config

```bash
 $ uda-to-typescript
 # or
 $ uda-to-typescript --config ./udaconvert.config.ts
```

**Note:** *uda-to-typescript uses [cosmic-config](https://github.com/cosmiconfig/cosmiconfig) to locate config files.*

**File udaconvert.config.ts**

```js
import { defineConfig } from '@jdpnielsen/uda-to-typescript';

export default defineConfig({
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

For Umbraco 14+ migrations, custom property editors may be exported with a core `EditorAlias` (for example `Umbraco.Plain.Json`) and the original editor alias moved to `EditorUiAlias`.
Custom handlers can therefore also be registered by `EditorUiAlias`, for example `Noa.CustomLinkPicker`.

## Umbraco v17 support

This library supports newer Umbraco UDA exports (v14+ including v17) where datatypes can be migrated to a split editor model:

- `EditorAlias` can point to a core schema alias (for example `Umbraco.Plain.Json`)
- `EditorUiAlias` carries the UI/editor alias (for example `Noa.CustomLinkPicker`)

The generator now resolves handlers by `EditorUiAlias` first, then `EditorAlias`. This means custom handlers continue to work after Umbraco migration without rewriting your UDA files.

## Migration notes for consumers (v13 -> v17)

When moving your Umbraco project to v17, review these points in your consuming app:

1. Update any custom datatype handlers to register by `EditorUiAlias` when relevant.
2. Expect some editor configs to contain fewer enumerated values in UDA than before.
3. For migrated editors using `Umbraco.Plain.*`, generated types may be broader unless you provide a custom handler.
4. `Umbraco.RichText` is now handled and maps to `{ markup: string }`.
5. Label datatypes now infer value kind from `umbracoDataValueType` instead of resolving to `never`.
6. Some custom editor configs can now omit fields you previously depended on (for example `items`) and booleans can appear as `'0'` / `'1'` strings.

### Custom handler example using EditorUiAlias

```ts
import { defineConfig, dataTypes } from '@jdpnielsen/uda-to-typescript';

export default defineConfig({
	input: '../umbraco/Deploy/Revision/*.uda',
	output: './src/umbraco/types.ts',
	dataTypes: {
		...dataTypes,
		'Noa.CustomLinkPicker': {
			editorAlias: 'Noa.CustomLinkPicker',
			build: () => [],
			reference: () => 'UrlItem',
		},
	},
});
```

### Making custom handlers resilient to v17 config shapes

When migrating custom handlers, avoid assuming config arrays always exist.

```ts
const config = dataType.Configuration as {
	multiple?: boolean | '0' | '1';
	items?: Array<{ key: string; value: string }>;
};

const isMultiple = config.multiple === true || config.multiple === '1';
const items = Array.isArray(config.items) ? config.items : [];

if (items.length === 0) {
	return isMultiple ? 'string[]' : 'string';
}
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

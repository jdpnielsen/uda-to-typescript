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
	input: './UmbracoProject/umbraco/Deploy/Revision/*.uda',
	output: './src/umbraco/output.ts',
});
```

## Provide custom datatypes

```js
import { dataTypes, defineConfig, HandlerConfig } from '@jdpnielsen/uda-to-typescript';
import { factory } from 'typescript';

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

## Umbraco version target

This library targets Umbraco v17 artifact exports and Delivery API v2.
Earlier Umbraco exports and Delivery API v1 conventions are not supported.

Test fixtures and examples in this branch use the `current` fixture set under `src/__tests__/__fixtures__/current`.

For custom property editors, Umbraco can export a split editor model:

- `EditorAlias` can point to a core schema alias (for example `Umbraco.Plain.Json`)
- `EditorUiAlias` carries the UI/editor alias (for example `Noa.CustomLinkPicker`)

The generator resolves handlers by `EditorUiAlias` first, then `EditorAlias`.

### Current behavior notes

1. Register custom datatype handlers by `EditorUiAlias` when relevant.
2. Some editor configs contain fewer enumerated values than earlier exports.
3. Migrated editors using `Umbraco.Plain.*` can produce broader types unless you provide a custom handler.
4. Some custom editor configs can omit fields you depended on (for example `items`) and booleans can appear as `'0'` / `'1'` strings.

### Data type alias emission (default on)

By default, the generator emits a named type alias for every data type artifact:

```ts
export type ApprovedColor = string | null;
```

This improves discoverability in consumer projects, even when a data type is not currently referenced by a document or media type.

If you need legacy behavior, disable it in config:

```ts
export default defineConfig({
	input: '../umbraco/Deploy/Revision/*.uda',
	output: './src/umbraco/types.ts',
	emitDataTypeAliases: false,
});
```

### Custom handler example using EditorUiAlias

```ts
import { dataTypes, defineConfig } from '@jdpnielsen/uda-to-typescript';

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

### Making custom handlers resilient to current config shapes

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

## Generated fetchers (Delivery API v2)

Generated `fetcher.ts` helpers call Delivery API v2 endpoints.

- `buildContentFetcher` calls `/umbraco/delivery/api/v2/content`
- `buildContentItemFetcher` calls `/umbraco/delivery/api/v2/content/item/{id}`

```ts
import { buildContentFetcher } from './fetcher';

const getContent = buildContentFetcher<SiteRoot>('https://example.com');
```

### `UMBRACO_NO_CACHE` runtime flag

Teams commonly use `UMBRACO_NO_CACHE` in local development and preview environments to bypass response caching while validating content and media changes.

`uda-to-typescript` does **not** read environment variables directly in generated fetchers. Instead, pass a custom fetch function and apply cache behavior there.

Recommended semantics:

- `UMBRACO_NO_CACHE=true` or `UMBRACO_NO_CACHE=1`: disable caching (`cache: 'no-store'`) and add a cache-buster query parameter.
- Any other value (or unset): keep normal/default caching behavior.

```ts
import { buildContentFetcher } from './fetcher';
import type { FetchFunction } from './fetcher';

const noCache = process.env.UMBRACO_NO_CACHE === 'true' || process.env.UMBRACO_NO_CACHE === '1';

const fetchFunction: FetchFunction = async <T>({ url, options }) => {
	const nextUrl = new URL(url.toString());

	if (noCache) {
		nextUrl.searchParams.set('_ts', Date.now().toString());
	}

	const response = await fetch(nextUrl, {
		...options,
		cache: noCache ? 'no-store' : options?.cache,
	});

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	return response.json() as Promise<T>;
};

export const getContent = buildContentFetcher<SiteRoot>('https://example.com', fetchFunction);
```

Practical guidance:

- Use this flag in development/preview only.
- Keep it off in production unless you explicitly need real-time freshness over cache efficiency.
- If your platform adds caching upstream (CDN/reverse proxy), pair this with appropriate cache-control headers in your hosting layer.

[build-img]:https://github.com/jdpnielsen/uda-to-typescript/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/jdpnielsen/uda-to-typescript/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/@jdpnielsen/uda-to-typescript
[downloads-url]:https://npmtrends.com/@jdpnielsen/uda-to-typescript
[npm-img]:https://img.shields.io/npm/v/@jdpnielsen/uda-to-typescript
[npm-url]:https://www.npmjs.com/package/@jdpnielsen/uda-to-typescript
[issues-img]:https://img.shields.io/github/issues/jdpnielsen/uda-to-typescript
[issues-url]:https://github.com/jdpnielsen/uda-to-typescript/issues
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/

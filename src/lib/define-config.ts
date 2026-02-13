import { DataTypeConfig } from './datatypes';

/**
 * Runtime configuration consumed by the CLI and conversion pipeline.
 */
export type UDAConvertConfiguration = {
	/** Input glob */
	input: string;

	/** Output file */
	output: string;

	/**
	 * @example
	 * ```ts
	 * dataTypes: {
	 * 	'Umbraco.CustomPropertyEditor': {
	 * 		init: () => {},
	 * 		build: () => {},
	 * 		reference: () => {},
	 * 	}
	 * }
	 *
	 * // Umbraco 14+ custom editors can also be keyed by EditorUiAlias.
	 * dataTypes: {
	 * 	'Noa.CustomLinkPicker': {
	 * 		init: () => {},
	 * 		build: () => {},
	 * 		reference: () => {},
	 * 	}
	 * }
	 * ```
	 */
	dataTypes?: DataTypeConfig;
};

/**
 * Identity helper that preserves literal inference for config objects.
 *
 * @example
 * ```ts
 * export default defineConfig({
 * 	input: './umbraco/Deploy/Revision/*.uda',
 * 	output: './src/umbraco/types.ts',
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export function defineConfig(config: UDAConvertConfiguration): UDAConvertConfiguration {
	return config;
}

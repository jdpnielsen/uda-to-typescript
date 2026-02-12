import { DataTypeConfig } from './datatypes';

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

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export function defineConfig(config: UDAConvertConfiguration): UDAConvertConfiguration {
	return config;
}

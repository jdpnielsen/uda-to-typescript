/**
 * Parses Umbraco config boolean-like values.
 *
 * Supported values:
 * - `true` / `false`
 * - `'1'` / `'0'`
 *
 * Returns `undefined` when the value is not recognized.
 */
export function parseBooleanConfigValue(value: unknown): boolean | undefined {
	if (value === true || value === '1') {
		return true;
	}

	if (value === false || value === '0') {
		return false;
	}

	return undefined;
}

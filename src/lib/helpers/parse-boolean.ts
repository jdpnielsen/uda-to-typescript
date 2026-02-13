export function parseBooleanConfigValue(value: unknown): boolean | undefined {
	if (value === true || value === '1') {
		return true;
	}

	if (value === false || value === '0') {
		return false;
	}

	return undefined;
}

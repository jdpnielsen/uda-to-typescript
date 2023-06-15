/**
 * Partitions an array into two arrays based on a test function.
 */
export function partitionArray<T>(items: T[], test: (value: T) => boolean): [T[], T[]] {
	const truthy: T[] = [];
	const falsy: T[] = [];

	for (const item of items) {
		if (test(item)) {
			truthy.push(item);
		} else {
			falsy.push(item);
		}
	}

	return [truthy, falsy];
}

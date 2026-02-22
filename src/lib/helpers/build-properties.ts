import type { PropertyGroup, PropertyType } from '../types/shared';

interface Collectable {
	PropertyGroups: PropertyGroup[];
	PropertyTypes: PropertyType[];
}

/**
 * Collects all property definitions for a document/media type.
 *
 * Umbraco can place properties at the root (`PropertyTypes`) and inside groups.
 * This helper flattens both sources into a single list.
 */
export function collectProperties<T extends Collectable>(type: T): PropertyType[] {
	const properties = [
		...type.PropertyTypes,
		...type.PropertyGroups.flatMap((group) => group.PropertyTypes),
	];

	return properties;
}

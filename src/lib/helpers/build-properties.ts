import { PropertyGroup, PropertyType } from '../types/shared';

type Collectable = {
	PropertyGroups: PropertyGroup[];
	PropertyTypes: PropertyType[];
}

export function collectProperties<T extends Collectable>(type: T): PropertyType[] {
	const properties = [
		...type.PropertyTypes,
		...type.PropertyGroups.flatMap((group) => group.PropertyTypes),
	];

	return properties;
}

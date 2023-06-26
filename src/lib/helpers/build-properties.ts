import { DocumentType } from '../types/document-type';
import { MediaType } from '../types/media-type';

export function collectProperties<T extends MediaType | DocumentType>(type: T) {
	const properties = [
		...type.PropertyTypes,
		...type.PropertyGroups.flatMap((group) => group.PropertyTypes),
	];

	return properties;
}

import { UDI } from '../types/utils';
import { DocumentType } from '../types/document-type';
import { MediaType } from '../types/media-type';

export function getPickableTypes<T extends DocumentType | MediaType>(types: T[]) {
	return types.filter((type) => {
		if (type.Permissions.AllowedAtRoot) {
			return true;
		}

		return isAllowedChildContentTypes(type.Udi, types);
	});
}

export function isAllowedChildContentTypes<T extends DocumentType | MediaType>(udi: UDI, types: T[]) {
	return types.some((type) => {
		return type.Permissions.AllowedChildContentTypes.includes(udi);
	});
}

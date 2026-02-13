import { UDI } from '../types/utils';
import { DocumentType } from '../types/document-type';
import { MediaType } from '../types/media-type';

/**
 * Returns types that can be selected in pickers.
 *
 * A type is considered pickable when it is allowed at root or referenced from
 * any other type's `AllowedChildContentTypes`.
 */
export function getPickableTypes<T extends DocumentType | MediaType>(types: T[]) {
	return types.filter((type) => {
		if (type.Permissions.AllowedAtRoot) {
			return true;
		}

		return isAllowedChildContentTypes(type.Udi, types);
	});
}

/**
 * Checks whether a UDI is referenced by any type as allowed child content.
 */
export function isAllowedChildContentTypes<T extends DocumentType | MediaType>(udi: UDI, types: T[]) {
	return types.some((type) => {
		return type.Permissions.AllowedChildContentTypes.includes(udi);
	});
}

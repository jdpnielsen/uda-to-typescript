import type { Artifact, GUID, typedUDI } from '../types/utils';

/**
 * Splits a UDI into artifact type and id parts.
 */
export function parseUdi<A extends Artifact>(udi: typedUDI<A>): { type: A; id: string } {
	const [artifact, id] = udi
		.replace('umb://', '')
		.split('/');

	return {
		type: artifact as A,
		id,
	};
}

/**
 * Normalizes a GUID by removing dashes.
 *
 * Umbraco artifact filenames and map keys commonly use this format.
 */
export function convertGuidToId(guid: GUID): string {
	return guid.replaceAll('-', '');
}

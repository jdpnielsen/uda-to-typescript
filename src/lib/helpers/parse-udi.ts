import { Artifact, GUID, typedUDI } from '../types/utils';

export function parseUdi<A extends Artifact>(udi: typedUDI<A>): { type: A; id: string } {
	const [artifact, id] = udi
		.replace('umb://', '')
		.split('/');

	return {
		type: artifact as A,
		id,
	};
}

export function convertGuidToId(guid: GUID): string {
	return guid.replaceAll('-', '');
}

import { ArtifactContainer } from './collect-artifacts';
import { parseUdi } from './parse-udi';
import type { DataType } from '../types/data-type';
import type { DocumentType } from '../types/document-type';
import type { MediaType } from '../types/media-type';
import { Artifact, typedUDI } from '../types/utils';

type ArtifactMap = {
	'data-type': DataType,
	'document-type': DocumentType,
	'media-type': MediaType,
}

/**
 * Retrieves a typed artifact from the pre-collected artifact container by UDI.
 */
export function getArtifact<A extends Artifact>(artifacts: ArtifactContainer, udi: typedUDI<A>): ArtifactMap[A] | undefined {
	const { type, id } = parseUdi(udi);

	return artifacts[type].get(id) as ArtifactMap[A];
}

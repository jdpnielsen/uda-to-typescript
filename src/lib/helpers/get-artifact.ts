import type { DataType } from '../types/data-type';
import type { DataTypeContainer } from '../types/data-type-container';
import type { DocumentType } from '../types/document-type';
import type { DocumentTypeContainer } from '../types/document-type-container';
import type { Language } from '../types/language';
import type { MediaType } from '../types/media-type';
import type { Template } from '../types/template';
import type { Artifact, typedUDI } from '../types/utils';
import type { ArtifactContainer } from './collect-artifacts';
import { parseUdi } from './parse-udi';

interface ArtifactMap {
	'data-type': DataType;
	'document-type': DocumentType;
	'media-type': MediaType;
	'template': Template;
	'language': Language;
	'document-type-container': DocumentTypeContainer;
	'data-type-container': DataTypeContainer;
}

/**
 * Retrieves a typed artifact from the pre-collected artifact container by UDI.
 */
export function getArtifact<A extends Artifact>(artifacts: ArtifactContainer, udi: typedUDI<A>): ArtifactMap[A] | undefined {
	const { type, id } = parseUdi(udi);

	return artifacts[type].get(id) as ArtifactMap[A];
}

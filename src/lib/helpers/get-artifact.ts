import { ArtifactContainer } from './collect-artifacts';
import { parseUdi } from './parse-udi';
import { DataType } from '../types/data-type';
import { MediaType } from '../types/media-type';
import { Artifact, typedUDI } from '../types/utils';

type ArtifactMap = {
	'data-type': DataType,
	'document-type': DocumentType,
	'media-type': MediaType,
}

export function getArtifact<A extends Artifact>(artifacts: ArtifactContainer, udi: typedUDI<A>): ArtifactMap[A] | undefined {
	const { type, id } = parseUdi(udi);

	return artifacts[type].get(id) as ArtifactMap[A];
}

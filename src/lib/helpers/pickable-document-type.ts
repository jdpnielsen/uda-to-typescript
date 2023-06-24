import { UDI } from '../types/utils';
import { ArtifactContainer } from './collect-artifacts';
import { DocumentType } from '../types/document-type';

export function getPickableDocumentTypes(artifacts: ArtifactContainer) {
	const documentTypes = Array.from(artifacts['document-type'].entries())
		.map(([, documentType]) => (documentType));

	return documentTypes.filter((documentType) => {
		if (documentType.Permissions.AllowedAtRoot) {
			return true;
		}

		return isAllowedChildContentTypes(documentType.Udi, documentTypes);
	});
}

export function isAllowedChildContentTypes(udi: UDI, documentTypes: DocumentType[]) {
	return documentTypes.some((documentType) => {
		return documentType.Permissions.AllowedChildContentTypes.includes(udi);
	});
}

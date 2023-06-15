import ts from 'typescript';

import { ArtifactContainer } from './helpers/collect-artifacts';
import { dataTypeMap } from './datatypes';
import { documentHandler } from './documenttypes';

export function buildTypes(artifacts: ArtifactContainer): ts.NodeArray<ts.Node> {
	const dataTypes = Array.from(artifacts['data-type'].entries())
		.map(([, dataType]) => (dataType));

	const statements: ts.Node[] = [];

	/** Initialize datatypes */
	const configuredEditors = Array
		.from(new Set(dataTypes.map((dataType) => dataType.EditorAlias)).values());

	for (const editorAlias of configuredEditors) {
		const handler = dataTypeMap[editorAlias];

		if (handler && handler.init) {
			const nodes = handler.init(artifacts);

			if (nodes) {
				statements.push(...nodes);
			}
		}
	}

	/** Build datatype instances */
	for (const dataType of dataTypes) {
		const handler = dataTypeMap[dataType.EditorAlias];

		if (handler) {
			const nodes = handler.build(dataType, artifacts);

			if (nodes) {
				statements.push(...nodes);
			}
		}
	}

	/** Build datatypes */
	const documentTypes = Array.from(artifacts['document-type'].entries())
		.map(([, documentType]) => (documentType));

	for (const documentType of documentTypes) {
		const nodes = documentHandler.build(documentType, artifacts);

		if (nodes) {
			statements.push(
				ts.factory.createIdentifier('\n'),
				...nodes
			);
		}
	}

	return ts.factory.createNodeArray(statements);
}

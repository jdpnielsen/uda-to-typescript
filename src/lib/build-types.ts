import ts, { factory } from 'typescript';

import { ArtifactContainer } from './helpers/collect-artifacts';
import { dataTypeMap } from './datatypes';
import { documentHandler } from './documenttypes';
import { newLineAST } from './helpers/ast/newline';
import { getPickableDocumentTypes } from './helpers/pickable-document-type';

export function buildTypes(artifacts: ArtifactContainer): ts.NodeArray<ts.Node> {
	const dataTypes = Array.from(artifacts['data-type'].entries())
		.map(([, dataType]) => (dataType));

	const statements: ts.Node[] = [
		ts.factory.createImportDeclaration(
			undefined,
			ts.factory.createImportClause(
				false,
				undefined,
				ts.factory.createNamedImports([
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseDocumentType')
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('EmptyObjectType')
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseGridBlockType')
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseBlockType')
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseGridBlockAreaType')
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseBlockListType')
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseBlockGridType')
					),
				])
			),
			ts.factory.createStringLiteral('./base-types')
		),
		newLineAST,
	];

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
				...nodes,
			);
		}
	}

	/** Build union of pickable datatypes */
	if (documentTypes.length !== 0) {
		statements.push(
			ts.factory.createIdentifier('\n'),
			ts.factory.createTypeAliasDeclaration(
				[factory.createToken(ts.SyntaxKind.ExportKeyword)],
				factory.createIdentifier('PickableDocumentType'),
				undefined,
				ts.factory.createUnionTypeNode(
					getPickableDocumentTypes(artifacts)
						.map((documentType) => documentHandler.reference(documentType, artifacts))
				),
			),
		);
	}

	return ts.factory.createNodeArray(statements);
}

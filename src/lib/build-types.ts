import ts, { factory } from 'typescript';

import { ArtifactContainer } from './helpers/collect-artifacts';
import { DataTypeConfig } from './datatypes';
import { documentHandler } from './documenttypes';
import { newLineAST } from './helpers/ast/newline';
import { getPickableTypes } from './helpers/pickable-document-type';
import { mediaTypeHandler } from './media-types';
import { parseStringStatements } from './helpers/ast/parse-string';

export type HandlerContext = {
	artifacts: ArtifactContainer;
	dataTypeHandlers: DataTypeConfig;
}

export function buildTypes(context: HandlerContext): ts.NodeArray<ts.Node> {
	const { artifacts, dataTypeHandlers } = context;
	const dataTypes = Array
		.from(artifacts['data-type'].values())
		.sort((a, b) => a.Udi.localeCompare(b.Udi));

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
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseMediaType')
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('Crop')
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('MediaPickerItem')
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('ReferencedDocument')
					),
				])
			),
			ts.factory.createStringLiteral('./base-types')
		),
		newLineAST,
	];

	/** Initialize datatypes */
	const configuredEditors = Array
		.from(new Set(dataTypes.map((dataType) => dataType.EditorAlias)).values())
		.sort((a, b) => a.localeCompare(b));

	for (const editorAlias of configuredEditors) {
		const handler = dataTypeHandlers[editorAlias];

		if (handler && handler.init) {
			const nodes = handler.init(artifacts);
			if (typeof nodes === 'string') {
				statements.push(...parseStringStatements(nodes));
			} else {
				statements.push(...nodes);
			}
		}
	}

	/** Build datatype instances */
	for (const dataType of dataTypes) {
		const handler = dataTypeHandlers[dataType.EditorAlias];

		if (handler) {
			const nodes = handler.build(dataType, artifacts);

			if (typeof nodes === 'string') {
				statements.push(...parseStringStatements(nodes));
			} else {
				statements.push(...nodes);
			}
		}
	}

	/** Build datatypes */
	const mediaTypes = Array
		.from(artifacts['media-type'].values())
		.sort((a, b) => a.Udi.localeCompare(b.Udi));

	for (const mediaType of mediaTypes) {
		const nodes = mediaTypeHandler.build(mediaType, context);

		if (nodes) {
			statements.push(
				ts.factory.createIdentifier('\n'),
				...nodes,
			);
		}
	}

	/** Build union of pickable mediaTypes */
	if (mediaTypes.length !== 0) {
		statements.push(
			ts.factory.createIdentifier('\n'),
			ts.factory.createTypeAliasDeclaration(
				[factory.createToken(ts.SyntaxKind.ExportKeyword)],
				factory.createIdentifier('PickableMediaType'),
				undefined,
				ts.factory.createUnionTypeNode(
					getPickableTypes(mediaTypes)
						.map((mediaType) => mediaTypeHandler.reference(mediaType, context))
				),
			),
		);
	}

	/** Build datatypes */
	const documentTypes = Array
		.from(artifacts['document-type'].values())
		.sort((a, b) => a.Udi.localeCompare(b.Udi));

	for (const documentType of documentTypes) {
		const nodes = documentHandler.build(documentType, context);

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
					getPickableTypes(documentTypes)
						.map((documentType) => documentHandler.reference(documentType, context))
				),
			),
		);
	}

	return ts.factory.createNodeArray(statements);
}

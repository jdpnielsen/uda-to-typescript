import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript';

import type { DataTypeConfig } from './datatypes';
import { resolveDataTypeHandler } from './datatypes';
import { documentHandler } from './documenttypes';
import { newLineAST } from './helpers/ast/newline';
import { parseStringStatements } from './helpers/ast/parse-string';
import { parseTypeNode } from './helpers/ast/parse-type';
import type { ArtifactContainer } from './helpers/collect-artifacts';
import { getPickableTypes } from './helpers/pickable-document-type';
import { mediaTypeHandler } from './media-types';
import type { DataType } from './types/data-type';

/**
 * Shared context passed to artifact handlers while generating AST nodes.
 */
export interface HandlerContext {
	artifacts: ArtifactContainer;
	dataTypeHandlers: DataTypeConfig;
}

/**
 * Additional generation options for `buildTypes`.
 */
export interface BuildTypesOptions {
	/**
	 * Emits `export type <DataTypeName> = ...` aliases for every data type.
	 *
	 * Enabled by default to keep generated output discoverable for consumers.
	 */
	emitDataTypeAliases?: boolean;
}

/**
 * Builds all generated TypeScript declarations for collected UDA artifacts.
 *
 * The function emits:
 * - shared imports from `base-types`
 * - datatype setup and declarations from registered handlers
 * - media/document type declarations
 * - `PickableMediaType` and `PickableDocumentType` unions
 */
export function buildTypes(context: HandlerContext & BuildTypesOptions): ts.NodeArray<ts.Node> {
	const {
		artifacts,
		dataTypeHandlers,
		emitDataTypeAliases = true,
	} = context;
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
						ts.factory.createIdentifier('BaseDocumentType'),
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('EmptyObjectType'),
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseGridBlockType'),
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseBlockType'),
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseGridBlockAreaType'),
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseBlockListType'),
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseBlockGridType'),
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('BaseMediaType'),
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('Crop'),
					),
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('MediaPickerItem'),
					),
				]),
			),
			ts.factory.createStringLiteral('./base-types'),
		),
		ts.factory.createImportDeclaration(
			undefined,
			ts.factory.createImportClause(
				false,
				undefined,
				ts.factory.createNamedImports([
					ts.factory.createImportSpecifier(
						true,
						undefined,
						ts.factory.createIdentifier('UmbracoForm'),
					),
				]),
			),
			ts.factory.createStringLiteral('./form'),
		),
		newLineAST,
	];

	/** Initialize datatypes */
	const initializedHandlers = new Set<string>();

	for (const dataType of dataTypes) {
		const resolvedHandler = resolveDataTypeHandler(dataTypeHandlers, dataType);

		if (resolvedHandler && resolvedHandler.handler.init && !initializedHandlers.has(resolvedHandler.key)) {
			initializedHandlers.add(resolvedHandler.key);

			const nodes = resolvedHandler.handler.init(artifacts);
			if (typeof nodes === 'string') {
				statements.push(...parseStringStatements(nodes));
			} else {
				statements.push(...nodes);
			}
		}
	}

	/** Build datatype instances */
	for (const dataType of dataTypes) {
		const resolvedHandler = resolveDataTypeHandler(dataTypeHandlers, dataType);

		if (resolvedHandler) {
			const nodes = resolvedHandler.handler.build(dataType, artifacts);

			if (typeof nodes === 'string') {
				statements.push(...parseStringStatements(nodes));
			} else {
				statements.push(...nodes);
			}
		}
	}

	if (emitDataTypeAliases) {
		const aliasNodes = buildDataTypeAliases({
			artifacts,
			dataTypes,
			dataTypeHandlers,
			existingStatements: statements,
		});

		if (aliasNodes.length !== 0) {
			statements.push(
				ts.factory.createIdentifier('\n'),
				...aliasNodes,
			);
		}
	}

	/** Build media types */
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
						.map((mediaType) => mediaTypeHandler.reference(mediaType, context)),
				),
			),
		);
	}

	/** Build document types */
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
						.map((documentType) => documentHandler.reference(documentType, context)),
				),
			),
		);
	}

	return ts.factory.createNodeArray(statements);
}

interface BuildDataTypeAliasesContext {
	artifacts: ArtifactContainer;
	dataTypes: DataType[];
	dataTypeHandlers: DataTypeConfig;
	existingStatements: ts.Node[];
}

/**
 * Emits discoverable type aliases for every resolved datatype artifact.
 */
function buildDataTypeAliases(context: BuildDataTypeAliasesContext): ts.TypeAliasDeclaration[] {
	const {
		artifacts,
		dataTypes,
		dataTypeHandlers,
		existingStatements,
	} = context;

	const occupiedNames = getOccupiedTypeNames(existingStatements);

	for (const documentType of artifacts['document-type'].values()) {
		occupiedNames.add(pascalCase(documentType.Alias));
	}

	for (const mediaType of artifacts['media-type'].values()) {
		occupiedNames.add(pascalCase(mediaType.Alias));
	}

	occupiedNames.add('PickableMediaType');
	occupiedNames.add('PickableDocumentType');

	const aliases: ts.TypeAliasDeclaration[] = [];

	for (const dataType of dataTypes) {
		const aliasName = pascalCase(dataType.Name);

		if (aliasName === '') {
			continue;
		}

		if (occupiedNames.has(aliasName)) {
			continue;
		}

		const resolvedHandler = resolveDataTypeHandler(dataTypeHandlers, dataType);

		const reference = resolvedHandler
			? toTypeNode(resolvedHandler.handler.reference(dataType, artifacts))
			: ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);

		if (!resolvedHandler) {
			console.warn(`Could not resolve handler for data type "${dataType.Name}" (${dataType.EditorAlias}${dataType.EditorUiAlias ? ` / ${dataType.EditorUiAlias}` : ''}), aliasing to unknown`);
		}

		aliases.push(
			factory.createTypeAliasDeclaration(
				[factory.createToken(ts.SyntaxKind.ExportKeyword)],
				factory.createIdentifier(aliasName),
				undefined,
				reference,
			),
		);

		occupiedNames.add(aliasName);
	}

	return aliases;
}

/**
 * Converts handler reference output to a concrete `TypeNode`.
 */
function toTypeNode(output: string | ts.TypeNode): ts.TypeNode {
	return typeof output === 'string'
		? parseTypeNode(output)
		: output;
}

/**
 * Collects currently declared symbol names to prevent duplicate type aliases.
 */
function getOccupiedTypeNames(nodes: ts.Node[]): Set<string> {
	const occupied = new Set<string>();

	for (const node of nodes) {
		if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isEnumDeclaration(node)) {
			occupied.add(node.name.text);
			continue;
		}

		if (ts.isClassDeclaration(node) && node.name) {
			occupied.add(node.name.text);
			continue;
		}

		if (ts.isVariableStatement(node)) {
			for (const declaration of node.declarationList.declarations) {
				if (ts.isIdentifier(declaration.name)) {
					occupied.add(declaration.name.text);
				}
			}
			continue;
		}

		if (ts.isImportDeclaration(node) && node.importClause) {
			if (node.importClause.name) {
				occupied.add(node.importClause.name.text);
			}

			if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
				for (const specifier of node.importClause.namedBindings.elements) {
					occupied.add(specifier.name.text);
				}
			}
		}
	}

	return occupied;
}

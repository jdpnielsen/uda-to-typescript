import ts, { factory } from 'typescript';
import { DocumentType } from '../types/document-type';
import { pascalCase } from 'change-case';
import { parseUdi } from '../helpers/parse-udi';
import { collectProperties } from '../helpers/build-properties';
import { exportToken } from '../helpers/ast/export-token';
import { HandlerContext } from '../build-types';
import { parseStringStatements } from '../helpers/ast/parse-string';

export type HandlerConfig = {
	build: (dataType: DocumentType, context: HandlerContext) => ts.Node[];
	reference: (dataType: DocumentType, context: HandlerContext) => ts.TypeReferenceNode;
}

export const documentHandler: HandlerConfig = {
	build,
	reference,
}

function build(documentType: DocumentType, { artifacts, dataTypeHandlers }: HandlerContext): ts.Node[] {
	const variableIdentifier = pascalCase(documentType.Alias);

	// TODO: Handle cultures
	const properties = collectProperties(documentType)
		.map(propertyType => {
			const { id: dataTypeId } = parseUdi(propertyType.DataType);
			const artifact = artifacts['data-type'].get(dataTypeId);

			if (!artifact) {
				console.warn(`Could not find data type with id ${dataTypeId}`);

				return factory.createPropertySignature(
					undefined,
					factory.createIdentifier(propertyType.Name),
					undefined,
					ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
				);
			}

			if (!dataTypeHandlers[artifact.EditorAlias]) {
				console.warn(`Could not find handler for data type ${artifact.EditorAlias}`);

				return factory.createPropertySignature(
					undefined,
					factory.createIdentifier(propertyType.Alias),
					undefined,
					ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
				);
			}

			const referenceOutput = dataTypeHandlers[artifact.EditorAlias].reference(artifact, artifacts);
			const reference =	typeof referenceOutput === 'string'
				? parseStringStatements(referenceOutput)[0] as ts.TypeNode
				: referenceOutput;

			return factory.createPropertySignature(
				undefined,
				factory.createIdentifier(propertyType.Alias),
				propertyType.Mandatory
					? undefined
					: factory.createToken(ts.SyntaxKind.QuestionToken),
				reference,
			);
		});

	return [
		factory.createTypeAliasDeclaration(
			[exportToken],
			factory.createIdentifier(variableIdentifier),
			undefined,
			factory.createTypeReferenceNode(
				factory.createIdentifier('BaseDocumentType'),
				[
					factory.createLiteralTypeNode(factory.createStringLiteral(documentType.Alias)),
					properties.length === 0
						? factory.createTypeReferenceNode(factory.createIdentifier('EmptyObjectType'))
						: factory.createTypeLiteralNode(properties)
				]
			)
		)
	];
}

function reference(documentType: DocumentType): ts.TypeReferenceNode {
	const variableIdentifier = pascalCase(documentType.Alias);

	return factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier)
	);
}

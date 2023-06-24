import ts, { factory } from 'typescript';
import { DocumentType } from '../types/document-type';
import { pascalCase } from 'change-case';
import { dataTypeMap } from '../datatypes';
import { parseUdi } from '../helpers/parse-udi';
import { ArtifactContainer } from '../helpers/collect-artifacts';

export type HandlerConfig = {
	build: (dataType: DocumentType, artifacts: ArtifactContainer,) => ts.Node[];
	reference: (dataType: DocumentType, artifacts: ArtifactContainer,) => ts.TypeReferenceNode;
}

export const documentHandler: HandlerConfig = {
	build,
	reference,
}

function build(documentType: DocumentType, artifacts: ArtifactContainer): ts.Node[] {
	const variableIdentifier = pascalCase(documentType.Alias);

	// TODO: Handle cultures

	const properties = [
		...documentType.PropertyTypes,
		...documentType.PropertyGroups.flatMap((group) => group.PropertyTypes),
	]
		.map(propertyType => {
			const { id: dataTypeId } = parseUdi(propertyType.DataType);
			const dataType = artifacts['data-type'].get(dataTypeId);

			if (!dataType) {
				console.warn(`Could not find data type with id ${dataTypeId}`);

				return factory.createPropertySignature(
					undefined,
					factory.createIdentifier(propertyType.Name),
					undefined,
					ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
				);
			}

			if (!dataTypeMap[dataType.EditorAlias]) {
				console.warn(`Could not find handler for data type ${dataType.EditorAlias}`);

				return factory.createPropertySignature(
					undefined,
					factory.createIdentifier(propertyType.Alias),
					undefined,
					ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
				);
			}

			const reference = dataTypeMap[dataType.EditorAlias].reference(dataType, artifacts);

			return factory.createPropertySignature(
				undefined,
				factory.createIdentifier(propertyType.Alias),
				undefined,
				reference,
			);
		})

	return [
		factory.createTypeAliasDeclaration(
			[factory.createToken(ts.SyntaxKind.ExportKeyword)],
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
	const variableIdentifier = pascalCase(documentType.Name);

	return factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier)
	);
}

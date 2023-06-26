import ts, { factory } from 'typescript';
import { MediaType } from '../types/media-type';
import { pascalCase } from 'change-case';
import { dataTypeMap } from '../datatypes';
import { parseUdi } from '../helpers/parse-udi';
import { ArtifactContainer } from '../helpers/collect-artifacts';
import { collectProperties } from '../helpers/build-properties';

export type HandlerConfig = {
	build: (dataType: MediaType, artifacts: ArtifactContainer,) => ts.Node[];
	reference: (dataType: MediaType, artifacts: ArtifactContainer,) => ts.TypeReferenceNode;
}

export const mediaTypeHandler: HandlerConfig = {
	build,
	reference,
}

function build(MediaType: MediaType, artifacts: ArtifactContainer): ts.Node[] {
	const variableIdentifier = pascalCase(MediaType.Alias);

	const properties = collectProperties(MediaType)
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
				factory.createIdentifier('BaseMediaType'),
				[
					factory.createLiteralTypeNode(factory.createStringLiteral(MediaType.Alias)),
					properties.length === 0
						? factory.createTypeReferenceNode(factory.createIdentifier('EmptyObjectType'))
						: factory.createTypeLiteralNode(properties)
				]
			)
		)
	];
}

function reference(MediaType: MediaType): ts.TypeReferenceNode {
	const variableIdentifier = pascalCase(MediaType.Alias);

	return factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier)
	);
}

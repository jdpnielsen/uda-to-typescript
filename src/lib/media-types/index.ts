import ts, { factory } from 'typescript';
import { MediaType } from '../types/media-type';
import { pascalCase } from 'change-case';
import { parseUdi } from '../helpers/parse-udi';
import { collectProperties } from '../helpers/build-properties';
import type { HandlerContext } from '../build-types';
import { parseStringStatements } from '../helpers/ast/parse-string';
import { PropertyType } from '../types/shared';
import { ArtifactContainer } from '../helpers/collect-artifacts';

export type MediaTypeHandler = {
	build: (dataType: MediaType, context: HandlerContext) => ts.Node[];
	reference: (dataType: MediaType, context: HandlerContext) => ts.TypeReferenceNode;
}

export const mediaTypeHandler: MediaTypeHandler = {
	build,
	reference,
}

function build(mediaType: MediaType, { artifacts, dataTypeHandlers }: HandlerContext): ts.Node[] {
	const variableIdentifier = pascalCase(mediaType.Alias);

	const props = collectProperties(mediaType);
	const extentions = getExtentions(props, artifacts);

	const properties = props
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

			if (!dataTypeHandlers[dataType.EditorAlias]) {
				console.warn(`Could not find handler for data type ${dataType.EditorAlias}`);

				return factory.createPropertySignature(
					undefined,
					factory.createIdentifier(propertyType.Alias),
					undefined,
					ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
				);
			}

			if (dataType.EditorAlias === 'Umbraco.Label' && propertyType.Alias === 'umbracoExtension') {
				return factory.createPropertySignature(
					undefined,
					factory.createIdentifier(propertyType.Alias),
					undefined,
					extentions,
				);
			}

			const referenceOutput = dataTypeHandlers[dataType.EditorAlias].reference(dataType, artifacts);
			const reference =	typeof referenceOutput === 'string'
				? parseStringStatements(referenceOutput)[0] as ts.TypeNode
				: referenceOutput;

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
					factory.createLiteralTypeNode(factory.createStringLiteral(mediaType.Alias)),
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

function getExtentions(properties: PropertyType[], artifacts: ArtifactContainer) {
	const uploadField = properties.find(prop => {
		const { id: dataTypeId } = parseUdi(prop.DataType);
		const dataType = artifacts['data-type'].get(dataTypeId);
		return dataType?.EditorAlias === 'Umbraco.UploadField';
	});

	const fallbackExtiontions = factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);

	if (!uploadField) {
		return fallbackExtiontions;
	}

	const { id: dataTypeId } = parseUdi(uploadField.DataType);
	const dataType = artifacts['data-type'].get(dataTypeId);

	if (!dataType) {
		return fallbackExtiontions;
	}

	const config = dataType.Configuration as {
		fileExtensions: { id: number; value: string }[];
	};

	if (!config.fileExtensions || config.fileExtensions.length === 0) {
		return fallbackExtiontions;
	}

	return factory.createUnionTypeNode(
		config.fileExtensions.map(extension => factory.createLiteralTypeNode(factory.createStringLiteral(extension.value)))
	)
}

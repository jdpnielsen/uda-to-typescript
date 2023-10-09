import ts, { factory } from 'typescript';
import { MediaType } from '../types/media-type';
import { pascalCase } from 'change-case';
import { parseUdi } from '../helpers/parse-udi';
import { collectProperties } from '../helpers/build-properties';
import type { HandlerContext } from '../build-types';

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

	const properties = collectProperties(mediaType)
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

			const reference = dataTypeHandlers[dataType.EditorAlias].reference(dataType, artifacts);

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

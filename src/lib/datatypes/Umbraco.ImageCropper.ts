import ts, { factory } from 'typescript'

import { DataType } from '../types/data-type';
import { buildCrops } from '../helpers/ast/media-object';

import type { HandlerConfig } from '.';

export type ImageCropperConfig = {
	crops: {
		alias: string;
		width: number;
		height: number;
	}[];
};

export const imageCropperHandler = {
	editorAlias: 'Umbraco.ImageCropper' as const,
	build,
	reference,
} satisfies HandlerConfig

export function build(): ts.Node[] {
	return [];
}

export function reference(dataType: DataType): ts.TypeNode {
	const config = dataType.Configuration as ImageCropperConfig;

	return factory.createTypeLiteralNode([
		factory.createPropertySignature(
			undefined,
			factory.createIdentifier('url'),
			undefined,
			factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
		),
		factory.createPropertySignature(
			undefined,
			factory.createIdentifier('focalPoint'),
			undefined,
			factory.createUnionTypeNode([
				factory.createTypeLiteralNode([
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier('left'),
						undefined,
						factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
					),
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier('top'),
						undefined,
						factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
					)
				]),
				factory.createLiteralTypeNode(factory.createNull())
			])
		),
		factory.createPropertySignature(
			undefined,
			factory.createIdentifier('crops'),
			undefined,
			factory.createTupleTypeNode(buildCrops(config.crops)),
		)
	]);
}

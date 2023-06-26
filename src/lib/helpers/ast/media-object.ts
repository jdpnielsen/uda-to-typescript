import { factory } from 'typescript';

interface Crop {
	alias: string;
	width: number;
	height: number;
}

export function buildCrops(crops: Crop[]) {
	return crops.map(crop => factory.createTypeReferenceNode(
		factory.createIdentifier('Crop'),
		[
			factory.createLiteralTypeNode(factory.createStringLiteral(crop.alias)),
			factory.createLiteralTypeNode(factory.createNumericLiteral(crop.width)),
			factory.createLiteralTypeNode(factory.createNumericLiteral(crop.height))
		]
	));
}

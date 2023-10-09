import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';
import { DataType } from '../types/data-type';

type SliderConfig = {
	enableRange: boolean,

	/* Unused */
	initVal1: number,
	initVal2: number,
	minVal: number,
	maxVal: number,
	step: number
};

export const sliderHandler = {
	editorAlias: 'Umbraco.Slider' as const,
	build: () => [],
	reference,
} satisfies HandlerConfig

export function reference(dataType: DataType): ts.TypeNode {
	const config = dataType.Configuration as SliderConfig;

	if (!config.enableRange) {
		return factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
	}

	return factory.createTypeLiteralNode([
		factory.createPropertySignature(
			undefined,
			factory.createStringLiteral('minimum'),
			undefined,
			factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
		),
		factory.createPropertySignature(
			undefined,
			factory.createStringLiteral('maximum'),
			undefined,
			factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
		)
	]);
}

import ts, { factory } from 'typescript';

import { parseBooleanConfigValue } from '../helpers/parse-boolean';
import type { DataType } from '../types/data-type';
import type { HandlerConfig } from '.';

interface SliderConfig {
	enableRange: boolean | '0' | '1';

	/* Unused */
	initVal1: number;
	initVal2: number;
	minVal: number;
	maxVal: number;
	step: number;
}

export const sliderHandler = {
	editorAlias: 'Umbraco.Slider' as const,
	build: () => [],
	reference,
} satisfies HandlerConfig;

export function reference(dataType: DataType): ts.TypeNode {
	const config = (dataType.Configuration || {}) as Partial<SliderConfig>;
	const enableRange = parseBooleanConfigValue(config.enableRange) ?? false;

	if (!enableRange) {
		return factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
	}

	return factory.createTypeLiteralNode([
		factory.createPropertySignature(
			undefined,
			factory.createStringLiteral('minimum'),
			undefined,
			factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
		),
		factory.createPropertySignature(
			undefined,
			factory.createStringLiteral('maximum'),
			undefined,
			factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
		),
	]);
}

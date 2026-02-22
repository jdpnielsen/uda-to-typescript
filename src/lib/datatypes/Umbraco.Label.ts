import ts, { factory } from 'typescript';

import type { DataType } from '../types/data-type';
import type { HandlerConfig } from '.';

interface LabelConfiguration {
	umbracoDataValueType?: string;
}

export const labelHandler = {
	editorAlias: 'Umbraco.Label' as const,
	build: () => [],
	reference,
} satisfies HandlerConfig;

function reference(dataType: DataType): ts.TypeNode {
	const config = (dataType.Configuration || {}) as LabelConfiguration;
	const valueType = config.umbracoDataValueType;

	switch (valueType) {
		case 'INT':
		case 'BIGINT':
		case 'DECIMAL': {
			return factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
		}

		case 'DATE':
		case 'DATETIME':
		case 'TIME':
		case 'STRING':
		case 'TEXT':
		case 'XML': {
			return factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
		}

		case 'JSON': {
			return factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
		}

		default: {
			return factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
		}
	}
}

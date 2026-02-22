import ts, { factory } from 'typescript';
import { pascalCase } from 'change-case';

import type { GUID } from '../types/utils';
import { convertGuidToId } from '../helpers/parse-udi';
import { exportToken } from '../helpers/ast/export-token';
import type { DataType } from '../types/data-type';
import type { HandlerConfig } from './index';

interface RichTextConfig {
	blocks?: {
		contentElementTypeKey: GUID;
		label?: string;
		editorSize?: string;
		forceHideContentEditorInOverlay?: boolean;
		displayInline?: boolean;
	}[];
}

export const richTextHandler = {
	editorAlias: 'Umbraco.RichText' as const,
	build: (dataType, artifacts) => {
		const config = dataType.Configuration as RichTextConfig;
		const variableIdentifier = pascalCase(dataType.Name);

		const blocks = (config.blocks || [])
			.map((block) => {
				const contentElement = artifacts['document-type'].get(convertGuidToId(block.contentElementTypeKey));

				if (!contentElement) {
					console.warn(`Could not find document type with id ${block.contentElementTypeKey}`);
					return undefined;
				}

				return factory.createTypeReferenceNode(
					factory.createIdentifier('BaseBlockType'),
					[
						factory.createTypeReferenceNode(
							factory.createIdentifier(pascalCase(contentElement.Alias)),
						),
						factory.createLiteralTypeNode(factory.createNull()),
					],
				);
			})
			.filter((e): e is ts.TypeReferenceNode => !!e);

		return [
			factory.createTypeAliasDeclaration(
				[exportToken],
				factory.createIdentifier(variableIdentifier),
				undefined,
				factory.createTypeLiteralNode([
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier('markup'),
						undefined,
						factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
					),
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier('blocks'),
						undefined,
						blocks.length
							? factory.createArrayTypeNode(
									factory.createUnionTypeNode(blocks),
								)
							: factory.createTupleTypeNode([]),
					),
				]),
			),
		];
	},
	reference,
} satisfies HandlerConfig;

function reference(dataType: DataType): ts.TypeNode {
	const variableIdentifier = pascalCase(dataType.Name);

	const baseType = factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier),
		undefined,
	);

	return baseType;
}

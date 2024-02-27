import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';
import { GUID } from '../types/utils';
import { convertGuidToId } from '../helpers/parse-udi';
import { pascalCase } from 'change-case';
import { exportToken } from '../helpers/ast/export-token';
import { DataType } from '../types/data-type';

type TinyMCEConfig = {
	editor?: {
		toolbar: string[];
		stylesheets: unknown[];
		maxImageSize: number;
		mode: 'inline' | 'classic';
		dimensions: { width: number | null }
	},
	blocks?: {
		contentElementTypeKey: GUID;
		label: string;
		editorSize: string;
		forceHideContentEditorInOverlay: boolean;
		displayInline: boolean;
	}[]
}

export const tinyMCEHandler = {
	editorAlias: 'Umbraco.TinyMCE' as const,
	build: (dataType, artifacts) => {
		const config = dataType.Configuration as TinyMCEConfig;
		const variableIdentifier = pascalCase(dataType.Name);

		const blocks = (config.blocks || [])
			.map((block) => {
				const contentElement = artifacts['document-type'].get(convertGuidToId(block.contentElementTypeKey));

				if (!contentElement) {
					console.warn(`Could not find document type with id ${block.contentElementTypeKey}`);
					return;
				}

				return factory.createTypeReferenceNode(
					factory.createIdentifier('BaseBlockType'),
					[
						factory.createTypeReferenceNode(
							factory.createIdentifier(pascalCase(contentElement.Alias))
						),
						factory.createLiteralTypeNode(factory.createNull())
					]
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
						factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
					),
					...(blocks.length === 0
						? []
						: [
							factory.createPropertySignature(
								undefined,
								factory.createIdentifier('blocks'),
								undefined,
								factory.createArrayTypeNode(
									factory.createUnionTypeNode(blocks)
								)
							)
						]),
				])
			)
		];
	},
	reference: reference,
} satisfies HandlerConfig

function reference(dataType: DataType): ts.TypeNode {
	const variableIdentifier = pascalCase(dataType.Name);

	const baseType = factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier),
		undefined
	);

	return baseType;
}

import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';
import { convertGuidToId } from '../helpers/parse-udi';
import { pascalCase } from 'change-case';
import { GUID } from '../types/utils';
import { DataType } from '../types/data-type';
import { ArtifactContainer } from '../helpers/collect-artifacts';

type BlockConfiguration = {
	blocks?: Block[];
	validationLimit?: {
		min?: number | null;
		max?: number | null;
	},
	useSingleBlockMode: false,
	useLiveEditing: false,
	useInlineEditingAsDefault: false
}

interface Block {
	contentElementTypeKey: GUID;
	settingsElementTypeKey?: GUID | null;
	label?: string,
	editorSize?: string,
	forceHideContentEditorInOverlay?: boolean
}

export const blockListHandler: HandlerConfig = {
	editorAlias: 'Umbraco.BlockList',
	build,
	reference,
}

function build(dataType: DataType, artifacts: ArtifactContainer): ts.Node[] {
	const config = dataType.Configuration as BlockConfiguration;
	const variableIdentifier = pascalCase(dataType.Name);

	const blocks = (config.blocks || [])
		.map(block => {
			const contentElement = artifacts['document-type'].get(convertGuidToId(block.contentElementTypeKey));
			const settingsElement = block.settingsElementTypeKey
				? artifacts['document-type'].get(convertGuidToId(block.settingsElementTypeKey))
				: undefined;

			if (!contentElement) {
				console.warn(`Could not find document type with id ${block.contentElementTypeKey}`);
				return;
			}

			return factory.createTypeLiteralNode([
				factory.createPropertySignature(
					undefined,
					factory.createStringLiteral('content'),
					undefined,
					factory.createTypeReferenceNode(
						factory.createIdentifier(pascalCase(contentElement.Alias))
					)
				),
				factory.createPropertySignature(
					undefined,
					factory.createStringLiteral('settings'),
					undefined,
					settingsElement
						? factory.createTypeReferenceNode(
							factory.createIdentifier(pascalCase(settingsElement.Alias))
						)
						: factory.createLiteralTypeNode(factory.createNull())
				)
			]);
		})
		.filter((e): e is ts.TypeLiteralNode => !!e);

	return [
		factory.createTypeAliasDeclaration(
			undefined,
			factory.createIdentifier(variableIdentifier),
			undefined,
			factory.createUnionTypeNode(blocks)
		)
	];
}

function reference(dataType: DataType): ts.TypeNode {
	const variableIdentifier = pascalCase(dataType.Name);

	const baseType = factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier),
		undefined
	);

	return factory.createTypeLiteralNode([factory.createPropertySignature(
		undefined,
		factory.createIdentifier('items'),
		undefined,
		factory.createArrayTypeNode(baseType)
	)])
}

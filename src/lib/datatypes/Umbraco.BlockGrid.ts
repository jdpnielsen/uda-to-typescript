import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';
import { convertGuidToId } from '../helpers/parse-udi';
import { pascalCase } from 'change-case';
import { GUID } from '../types/utils';
import { DataType } from '../types/data-type';
import { ArtifactContainer } from '../helpers/collect-artifacts';
import { DocumentType } from '../types/document-type';
import { exportToken } from '../helpers/ast/export-token';

type BlockConfiguration = {
	blocks?: Block[];
	validationLimit?: {
		min?: number | null;
		max?: number | null;
	},
	useLiveEditing: false
}

interface Block {
	columnSpanOptions: unknown[];
	rowMinSpan: number;
	rowMaxSpan: number;
	allowAtRoot: boolean;
	allowInAreas: boolean;
	areas: Area[];
	contentElementTypeKey: GUID;
	settingsElementTypeKey?: GUID;
	view: string;
	label: string;
	editorSize: string;
	inlineEditing: boolean;
	forceHideContentEditorInOverlay: boolean;
}

interface Area {
	key: GUID;
	alias: string;
	columnSpan: number;
	rowSpan: number;
	minAllowed: number;
	specifiedAllowance: unknown[];
}

export const blockGridHandler: HandlerConfig = {
	editorAlias: 'Umbraco.BlockGrid',
	build,
	reference,
}

function build(dataType: DataType, artifacts: ArtifactContainer): ts.Node[] {
	const config = dataType.Configuration as BlockConfiguration;
	const variableIdentifier = pascalCase(dataType.Name);
	const variableWithoutAreasIdentifier = pascalCase(dataType.Name + 'WithoutAreas');

	const blocksWithArea: ts.TypeReferenceNode[] = [];
	const blocksWithoutArea: ts.TypeReferenceNode[] = [];

	(config.blocks || [])
		.forEach(block => {
			const contentElement = artifacts['document-type'].get(convertGuidToId(block.contentElementTypeKey));
			const settingsElement = block.settingsElementTypeKey
				? artifacts['document-type'].get(convertGuidToId(block.settingsElementTypeKey))
				: undefined;

			if (!contentElement) {
				console.warn(`Could not find document type with id ${block.contentElementTypeKey}`);
				return;
			}

			const areas = block.areas.map((area) => {
				return factory.createTypeReferenceNode(
					factory.createIdentifier('BaseGridBlockAreaType'),
					[
						factory.createLiteralTypeNode(
							factory.createStringLiteral(area.alias)
						),
						factory.createTypeReferenceNode(
							factory.createIdentifier(variableWithoutAreasIdentifier),
						)
					]
				);
			})

			const blockNode = factory.createTypeReferenceNode(
				factory.createIdentifier('BaseGridBlockType'),
				[
					factory.createTypeReferenceNode(
						factory.createIdentifier(pascalCase(contentElement.Alias))
					),
					settingsElement
						? factory.createTypeReferenceNode(
							factory.createIdentifier(pascalCase(settingsElement.Alias))
						)
						: factory.createLiteralTypeNode(factory.createNull()),
					...(areas.length !== 0
						? [factory.createArrayTypeNode(factory.createUnionTypeNode(areas))]
						: []
					)
				]
			);

			if (areas.length === 0) {
				blocksWithoutArea.push(blockNode);
			} else {
				blocksWithArea.push(blockNode);
			}
		});

	return [
		factory.createTypeAliasDeclaration(
			undefined,
			factory.createIdentifier(variableWithoutAreasIdentifier),
			undefined,
			factory.createUnionTypeNode(blocksWithoutArea)
		),
		factory.createTypeAliasDeclaration(
			[exportToken],
			factory.createIdentifier(variableIdentifier),
			undefined,
			factory.createTypeReferenceNode(
				factory.createIdentifier('BaseBlockGridType'),
				[factory.createUnionTypeNode([
					factory.createTypeReferenceNode(
						factory.createIdentifier(variableWithoutAreasIdentifier),
					),
					...blocksWithArea,
				])],
			)
		)
	];
}

function reference(dataType: DataType): ts.TypeNode {
	const variableIdentifier = pascalCase(dataType.Name);

	return factory.createTypeReferenceNode(
		factory.createIdentifier(variableIdentifier),
		undefined
	);
}

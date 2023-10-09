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
	specifiedAllowance: {
		elementTypeKey: GUID;
	}[];
}

export const blockGridHandler = {
	editorAlias: 'Umbraco.BlockGrid' as const,
	build,
	reference,
} satisfies HandlerConfig;

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
				throw new Error(`Could not find document type with id: ${block.contentElementTypeKey}`);
			}

			const areas = block.areas.map((area) => {
				const specifiedAllowances = area.specifiedAllowance
					.map((allowance) => {
						const blockEl = (config.blocks || [])
							.find((e) => e.contentElementTypeKey === allowance.elementTypeKey);

						if (!blockEl) {
							throw new Error(`Could not find block with element type key: ${allowance.elementTypeKey}`);
						}

						const contentEl = artifacts['document-type'].get(convertGuidToId(blockEl.contentElementTypeKey));
						if (!contentEl) {
							throw new Error(`Could not find document type with id: ${allowance.elementTypeKey}`);
						}

						const settingsEl = blockEl.settingsElementTypeKey
							? artifacts['document-type'].get(convertGuidToId(blockEl.settingsElementTypeKey))
							: undefined;

						return buildBlock(
							contentEl,
							settingsEl,
							[]
						);
					});

				return factory.createTypeReferenceNode(
					factory.createIdentifier('BaseGridBlockAreaType'),
					[
						factory.createLiteralTypeNode(
							factory.createStringLiteral(area.alias)
						),
						area.specifiedAllowance.length === 0
							? factory.createTypeReferenceNode(
								factory.createIdentifier(variableWithoutAreasIdentifier),
							)
							: factory.createUnionTypeNode(specifiedAllowances),
					]
				);
			})

			const blockNode = buildBlock(contentElement, settingsElement, areas);

			if (areas.length === 0) {
				blocksWithoutArea.push(blockNode);
			} else {
				blocksWithArea.push(blockNode);
			}
		});

	return [
		factory.createTypeAliasDeclaration(
			[exportToken],
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

function buildBlock(contentElement: DocumentType, settingsElement?: DocumentType | undefined, areas: ts.TypeReferenceNode[] = []): ts.TypeReferenceNode {
	return factory.createTypeReferenceNode(
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
	)
}

import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript';

import type { ArtifactContainer } from '../helpers/collect-artifacts';
import { convertGuidToId, parseUdi } from '../helpers/parse-udi';
import type { DataType } from '../types/data-type';
import type { GUID } from '../types/utils';
import type { HandlerConfig } from '.';

interface MultiNodeTreePickerConfiguration {
	startNode?: {
		type: 'content' | 'media' | 'member';
	};
	minNumber: number;
	maxNumber: number;
	showOpenButton?: boolean;
	ignoreUserStartNodes?: boolean;
	/**
	 * Comma separated list of content types which are allowed.
	 */
	filter?: GUID | `${GUID},${GUID}`;
}

export const multiNodePickerHandler = {
	editorAlias: 'Umbraco.MultiNodeTreePicker' as const,
	build,
	reference,
} satisfies HandlerConfig;

export function build(): ts.Node[] {
	return [];
}

export function reference(dataType: DataType, artifacts: ArtifactContainer): ts.TypeNode {
	const config = (dataType.Configuration || {}) as Partial<MultiNodeTreePickerConfiguration>;

	// if StartNode is undefined it should default to content behavior
	const startNodeType = config.startNode?.type || 'content';

	if (startNodeType === 'member') {
		/**
		 * Output: unkown[];
		 */
		return factory.createArrayTypeNode(
			factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
		);
	}

	if (!config.filter) {
		if (startNodeType === 'media') {
			/**
			 * Output: PickableMediaType[];
			 */
			return factory.createArrayTypeNode(
				factory.createTypeReferenceNode(
					factory.createIdentifier('PickableMediaType'),
				),
			);
		}

		/**
		 * Output: PickableDocumentType[];
		 */
		return factory.createArrayTypeNode(
			factory.createTypeReferenceNode(
				factory.createIdentifier('PickableDocumentType'),
			),
		);
	}

	const typeMap = startNodeType === 'content'
		? new Map(Array
			.from(artifacts['document-type'])
			.map(([, docType]) => [parseUdi(docType.Udi).id, docType]))
		: new Map(Array
			.from(artifacts['media-type'])
			.map(([, mediaType]) => [parseUdi(mediaType.Udi).id, mediaType]));

	const items = config.filter
		.split(',')
		.map((key) => convertGuidToId(key.trim() as GUID))
		.filter((alias) => alias !== '')
		.map((key) => {
			const item = typeMap.get(key);
			if (!item) {
				console.warn(`Could not find document type with alias "${key}".`);
				return undefined;
			}

			return item;
		})
		.filter((docType): docType is NonNullable<typeof docType> => !!docType);

	if (items.length === 0) {
		return factory.createArrayTypeNode(
			factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
		);
	}

	if (items.length === 1) {
		/**
		 * Output: Alias[];
		 */
		return factory.createArrayTypeNode(
			factory.createTypeReferenceNode(
				factory.createIdentifier(pascalCase(items[0].Alias)),
			),
		);
	}

	/**
	 * Output: (Alias1 | Alias2)[];
	 */
	return factory.createArrayTypeNode(
		factory.createUnionTypeNode(
			items.map((item) =>
				factory.createTypeReferenceNode(
					factory.createIdentifier(pascalCase(item.Alias)),
				),
			),
		),
	);
}

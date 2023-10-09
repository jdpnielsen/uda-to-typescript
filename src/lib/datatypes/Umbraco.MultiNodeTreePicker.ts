import ts, { factory } from 'typescript';
import { pascalCase } from 'change-case';
import type { HandlerConfig } from '.';
import { DataType } from '../types/data-type';
import { ArtifactContainer } from '../helpers/collect-artifacts';

type MultiNodeTreePickerConfiguration = {
	startNode: {
		type: 'content' | 'media' | 'member';
	};
	minNumber: number;
	maxNumber: number;
	showOpenButton: boolean;
	ignoreUserStartNodes: boolean;
	/**
	 * Comma separated list of content types which are allowed.
	 */
	filter?: string;
}

export const multiNodePickerHandler = {
	editorAlias: 'Umbraco.MultiNodeTreePicker' as const,
	build,
	reference,
} satisfies HandlerConfig

export function build(): ts.Node[] {
	return [];
}

export function reference(dataType: DataType, artifacts: ArtifactContainer): ts.TypeNode {
	const config = dataType.Configuration as MultiNodeTreePickerConfiguration;

	if (config.startNode.type !== 'content') {
		/**
		 * Output: unkown[];
		 */
		return factory.createArrayTypeNode(
			factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
		);
	}

	if (!config.filter) {
		/**
		 * Output: PickableDocumentType[];
		 */
		return factory.createArrayTypeNode(
			factory.createTypeReferenceNode(
				factory.createIdentifier('PickableDocumentType'),
			)
		);
	}

	const documentTypeMap = new Map(
		Array
			.from(artifacts['document-type'].entries())
			.map(([, docType]) => [docType.Alias, docType])
	);

	const documentTypes = config.filter
		.split(',')
		.map(alias => {
			const doc = documentTypeMap.get(alias);

			if (!doc) {
				console.log('documentTypeMap', documentTypeMap);
				throw new Error(`Document type with alias "${alias}" was not found.`);
			}

			return doc
		});

	if (documentTypes.length === 1) {
		/**
		 * Output: Alias[];
		 */
		return factory.createArrayTypeNode(
			factory.createTypeReferenceNode(
				factory.createIdentifier(pascalCase(documentTypes[0].Alias)),
			)
		);
	}

	/**
	 * Output: (Alias1 | Alias2)[];
	 */
	return factory.createArrayTypeNode(
		factory.createUnionTypeNode(
			documentTypes.map(docType =>
				factory.createTypeReferenceNode(
					factory.createIdentifier(pascalCase(docType.Alias)),
				)
			)
		)
	);
}

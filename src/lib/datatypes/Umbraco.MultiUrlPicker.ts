import ts, { factory } from 'typescript'

import type { HandlerConfig } from '.';

export const multiurlPickerHandler = {
	editorAlias: 'Umbraco.MultiUrlPicker' as const,
	init,
	build: () => [],
	reference,
} satisfies HandlerConfig

const UrlItem = `
export interface UrlItem {
	url: string | null;
	title: string;
	target: string | null;
	destinationId: string | null;
  /**
   * Document type of destination
   */
	destinationType: string | null;
	route: {
		path: string;
		startItem: {
			id: string;
			path: string;
		};
	} | null;
	linkType: string;
}
`;

function init(): ts.Node[] {
	const source = ts.createSourceFile(
		'file.ts',
		UrlItem,
		ts.ScriptTarget.Latest,
		true
	);

	return Array.from(source.statements);
}

function reference(): ts.TypeNode {
	const checkboxListType = factory.createTypeReferenceNode(
		factory.createIdentifier('UrlItem'),
		undefined
	);

	return factory.createArrayTypeNode(checkboxListType)
}

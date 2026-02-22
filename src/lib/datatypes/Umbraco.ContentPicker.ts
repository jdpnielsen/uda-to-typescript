import type ts from 'typescript';
import { factory } from 'typescript';

import { maybeNull } from '../helpers/ast/maybe-null';
import type { HandlerConfig } from '.';

export const contentPickerHandler = {
	editorAlias: 'Umbraco.ContentPicker' as const,
	build,
	reference,
} satisfies HandlerConfig;

export function build(): ts.Node[] {
	return [];
}

export function reference(): ts.TypeNode {
	/**
	 * Output: PickableDocumentType | null;
	 */
	return maybeNull(
		factory.createTypeReferenceNode(
			factory.createIdentifier('PickableDocumentType'),
		),
	);
}

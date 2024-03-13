import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';
import { maybeNull } from '../helpers/ast/maybe-null';

export const contentPickerHandler = {
	editorAlias: 'Umbraco.ContentPicker' as const,
	build,
	reference,
} satisfies HandlerConfig

export function build(): ts.Node[] {
	return [];
}

export function reference(): ts.TypeNode {
	/**
	 * Output: PickableDocumentType | null;
	 */
	return maybeNull(
		factory.createTypeReferenceNode(
			factory.createIdentifier('ReferencedDocument'),
			[factory.createTypeReferenceNode(
				factory.createIdentifier('PickableDocumentType'),
				undefined
			)]
		)
	);
}

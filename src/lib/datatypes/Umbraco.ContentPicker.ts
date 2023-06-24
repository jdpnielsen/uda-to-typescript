import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';
import { maybeNull } from '../helpers/ast/maybe-null';

export const contentPickerHandler: HandlerConfig = {
	editorAlias: 'Umbraco.ContentPicker',
	build,
	reference,
}

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
		)
	);
}

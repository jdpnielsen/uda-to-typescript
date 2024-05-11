import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const formPickerHandler = {
	editorAlias: 'UmbracoForms.FormPicker' as const,
	build,
	reference,
} satisfies HandlerConfig

export function build(): ts.Node[] {
	return [];
}

export function reference(): ts.TypeNode {
	return factory.createTypeReferenceNode(
		factory.createIdentifier('FormPickerType'),
		undefined
	);
}

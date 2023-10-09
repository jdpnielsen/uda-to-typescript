import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const eyedropperHandler = {
	editorAlias: 'Umbraco.ColorPicker.EyeDropper' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig

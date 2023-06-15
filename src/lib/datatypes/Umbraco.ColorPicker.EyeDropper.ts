import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const eyedropperHandler: HandlerConfig = {
	editorAlias: 'Umbraco.ColorPicker.EyeDropper',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}

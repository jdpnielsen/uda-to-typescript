import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const uploadFieldHandler: HandlerConfig = {
	editorAlias: 'Umbraco.UploadField',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
}

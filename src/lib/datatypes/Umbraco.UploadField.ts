import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const uploadFieldHandler = {
	editorAlias: 'Umbraco.UploadField' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
} satisfies HandlerConfig

import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const plainJsonHandler = {
	editorAlias: 'Umbraco.Plain.Json' as const,
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
} satisfies HandlerConfig

import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

// We might want to expose group information here.
// Due to the dynamic nature of tags, it's not really possible to know what tag values are available in each group,
// so i'm unsure if this actually improves the resulting type safety.
export const tagsHandler = {
	editorAlias: 'Umbraco.Tags' as const,
	build: () => [],
	reference: () => factory.createArrayTypeNode(
		factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
	),
} satisfies HandlerConfig

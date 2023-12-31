import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const labelHandler = {
	editorAlias: 'Umbraco.Label' as const,
	build: () => [],
	// TODO: Investigate if we should expose the actual output from the umbraco api (ie empty value of the chosen datatype)
	// but i can't really imagine a usecase for this.
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
} satisfies HandlerConfig

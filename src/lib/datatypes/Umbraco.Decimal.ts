import ts, { factory } from 'typescript';
import type { HandlerConfig } from '.';

export const decimalHandler: HandlerConfig = {
	editorAlias: 'Umbraco.Decimal',
	build: () => [],
	reference: () => factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
}

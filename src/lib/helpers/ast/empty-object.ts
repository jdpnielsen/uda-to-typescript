import ts, { factory } from 'typescript';

export const emptyObjectAST = factory.createTypeReferenceNode(
	factory.createIdentifier('Record'),
	[
		factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
		factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword)
	]
);

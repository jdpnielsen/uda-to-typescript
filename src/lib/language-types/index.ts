import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript';

import type { Language } from '../types/language';
import { createModernEnumHandler } from '../helpers/ast/modern-enum';
import { exportToken } from '../helpers/ast/export-token';
import type { ArtifactContainer } from '../helpers/collect-artifacts';

const name = 'Language';

export interface HandlerConfig {
	build: (context: { artifacts: ArtifactContainer }) => ts.Node[];
	reference: (dataType: Language) => ts.TypeReferenceNode;
}

export const languageHandler: HandlerConfig = {
	build,
	reference,
};

function build({ artifacts }: { artifacts: ArtifactContainer }): ts.Node[] {
	const languages = Array.from(artifacts.language.values()).map((lang) => ({
		key: pascalCase(lang.Name),
		value: lang.IsoCode,
		mandatory: lang.IsMandatory,
	}));

	const languageEnum = createModernEnumHandler(name, languages);

	if (languages.length === 0) {
		const cultures = factory.createTypeAliasDeclaration(
			[exportToken],
			factory.createIdentifier('Cultures'),
			undefined,
			factory.createTypeLiteralNode([factory.createIndexSignature(
				undefined,
				[factory.createParameterDeclaration(
					undefined,
					undefined,
					factory.createIdentifier('culture'),
					undefined,
					factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
					undefined,
				)],
				factory.createTypeReferenceNode(
					factory.createIdentifier('ContentRoute'),
					undefined,
				),
			)]),
		);

		return [
			...languageEnum,
			cultures,
		];
	}

	const cultures = factory.createTypeAliasDeclaration(
		[exportToken],
		factory.createIdentifier('Cultures'),
		undefined,
		factory.createTypeLiteralNode(languages.map((lang) => factory.createPropertySignature(
			undefined,
			factory.createComputedPropertyName(factory.createStringLiteral(lang.value)),
			lang.mandatory
				? undefined
				: factory.createToken(ts.SyntaxKind.QuestionToken),
			factory.createTypeReferenceNode('ContentRoute'),
		))),
	);

	return [
		...languageEnum,
		cultures,
	];
}

function reference(language: Language): ts.TypeReferenceNode {
	return factory.createTypeReferenceNode(
		factory.createIdentifier(language.IsoCode),
	);
}

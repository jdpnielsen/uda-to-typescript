module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.lint.json'],
	},
	'env': {
		'node': true
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
	],
	rules: {
		quotes: ['warn', 'single', { avoidEscape: true }],
		'@typescript-eslint/no-use-before-define': ['warn', { functions: false }],
		'@typescript-eslint/indent': [
			'error',
			'tab',
			{
				'ignoredNodes': [
					'PropertyDefinition[decorators]',
					'TSUnionType',
					'TSTypeParameterInstantiation',
					'TSIntersectionType'
				],
				'SwitchCase': 1
			}
		],
	},
	'overrides': [
		{
			'files': ['*.spec.ts'],
			rules: {
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-var-requires': 'off',
			},
		}
	],
};

import antfu from '@antfu/eslint-config';

export default antfu({
	node: true,
	stylistic: {
		indent: 'tab',
		semi: true,
		overrides: {
			'style/arrow-parens': ['error', 'always'],
			'style/no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
			'style/brace-style': ['error', '1tbs'],
		},
	},
	typescript: {
		overrides: {
			'ts/no-redeclare': 'off',
			'ts/consistent-type-imports': ['error', {
				disallowTypeAnnotations: false,
				fixStyle: 'inline-type-imports',
				prefer: 'type-imports',
			}],
		},
	},
	imports: {
		overrides: {
			'perfectionist/sort-imports': ['error', {
				groups: [
					'builtin',
					'external',
					['parent', 'sibling', 'index'],
					'side-effect',
					'unknown',
				],
				type: 'natural',
			}],
		},
	},
});

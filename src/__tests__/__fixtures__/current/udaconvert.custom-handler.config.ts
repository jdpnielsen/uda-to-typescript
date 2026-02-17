import { factory } from 'typescript';
import { defineConfig, dataTypes } from '../../../index';

export default defineConfig({
	input: './*.uda',
	output: '../../../../dist/current/custom-handler-output.ts',
	dataTypes: {
		...dataTypes,
		'Noa.CustomLinkPicker': {
			editorAlias: 'Noa.CustomLinkPicker',
			build: () => [],
			reference: () => factory.createTypeReferenceNode('UrlItem'),
		},
	},
});

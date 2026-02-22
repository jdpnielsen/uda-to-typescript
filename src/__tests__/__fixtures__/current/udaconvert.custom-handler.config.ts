import { dataTypes, defineConfig } from '@jdpnielsen/uda-to-typescript';
import { factory } from 'typescript';

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

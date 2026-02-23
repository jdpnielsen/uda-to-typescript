import { describe, expect, it } from 'vitest';

import { createDataType, printType } from '../helpers/test';
import { collectArtifacts } from '../helpers/collect-artifacts';
import { type BlockConfiguration, blockListHandler } from './Umbraco.BlockList';

describe('umbraco.BlockList', async () => {
	const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/current/*.uda');

	it('should handle build and reference enum', () => {
		const datatype = createDataType<BlockConfiguration>('Umbraco.BlockList', {
			blocks: [
				{
					contentElementTypeKey: '7a09a5cf-86c2-4794-a57e-b6a38640f2d9',
					label: 'Media',
					editorSize: 'medium',
					forceHideContentEditorInOverlay: false,
				},
				{
					contentElementTypeKey: '5f9ec177-39a2-4d33-9bcf-9d1409630509',
					editorSize: 'medium',
					forceHideContentEditorInOverlay: false,
				},
				{
					contentElementTypeKey: 'fe0ca33f-c8dd-4bad-9813-cb41761b9c32',
					editorSize: 'medium',
					forceHideContentEditorInOverlay: false,
				},
			],
			validationLimit: {},
			useSingleBlockMode: false,
			useLiveEditing: false,
			useInlineEditingAsDefault: true,
			maxPropertyWidth: '100%',
		});

		const buildValue = blockListHandler.build(datatype, artifacts);
		expect(printType(buildValue)).toMatchInlineSnapshot(`
			"export type Test = BaseBlockListType<BaseBlockType<MediaBlock, null> | BaseBlockType<RichtextBlock, null> | BaseBlockType<FormBlock, null>>;
			"
		`);

		const value = blockListHandler.reference(datatype);
		expect(printType(value)).toBe('Test');
	});

	it('should handle missing items', () => {
		const datatype = createDataType<BlockConfiguration>('Umbraco.BlockList', {});

		const buildValue = blockListHandler.build(datatype, artifacts);
		expect(printType(buildValue)).toMatchInlineSnapshot(`
			"export type Test = BaseBlockListType<never>;
			"
		`);

		const value = blockListHandler.reference(datatype);
		expect(printType(value)).toBe('Test');
	});
});

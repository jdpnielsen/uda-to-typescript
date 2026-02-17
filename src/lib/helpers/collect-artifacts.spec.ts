import { collectArtifacts } from './collect-artifacts';

describe('collectArtifacts', () => {
	it('Should handle a glob', async () => {
		const output = await collectArtifacts('./src/__tests__/__fixtures__/v17/*.uda');

		expect(output['data-type'].size).toBe(47);
		expect(output['document-type'].size).toBe(14);
		expect(output['media-type'].size).toBe(7);
	});

	it('Should handle a file path', async () => {
		const output = await collectArtifacts('./src/__tests__/__fixtures__/v17/data-type__f38f0ac71d27439c9f3f089cd8825a53.uda');

		expect(output['data-type'].size).toBe(1);
		expect(output['document-type'].size).toBe(0);
		expect(output['media-type'].size).toBe(0);
	});

	it('Should reject unsupported pre-v17 fixtures', async () => {
		await expect(collectArtifacts('./src/__tests__/__fixtures__/invalid/data-type__pre-v17.uda'))
			.rejects
			.toThrow('supports v17+ artifacts only');
	});
});

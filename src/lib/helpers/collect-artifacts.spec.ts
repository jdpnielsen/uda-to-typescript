import { collectArtifacts } from './collect-artifacts';

describe('collectArtifacts', () => {
	it('Should handle a glob', async () => {
		const output = await collectArtifacts('./src/__tests__/__fixtures__/*.uda');

		expect(output['data-type'].size).toBe(5);
		expect(output['document-type'].size).toBe(3);
		expect(output['media-type'].size).toBe(1);
	});

	it('Should handle a file path', async () => {
		const output = await collectArtifacts('./src/__tests__/__fixtures__/data-type__f38f0ac71d27439c9f3f089cd8825a53.uda');

		expect(output['data-type'].size).toBe(1);
		expect(output['document-type'].size).toBe(0);
		expect(output['media-type'].size).toBe(0);
	});
});

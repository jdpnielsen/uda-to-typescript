import { collectArtifacts } from './collect-artifacts';
import { getArtifact } from './get-artifact';

describe('getArtifact', () => {
	it('Should retrieve artifact by its UDI', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/*.uda');

		const dataType = getArtifact(artifacts, 'umb://data-type/f38f0ac71d27439c9f3f089cd8825a53');
		expect(dataType).toBeTruthy();
		expect(dataType?.Udi).toBe('umb://data-type/f38f0ac71d27439c9f3f089cd8825a53');
	});

	it('Should retrieve artifact by its UDI', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/*.uda');

		const dataType = getArtifact(artifacts, 'umb://data-type/asd');
		expect(dataType).toBeFalsy();
	});
});

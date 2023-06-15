import { collectArtifacts } from './helpers/collect-artifacts';
import { buildTypes } from './build-types';

describe('buildTypes', () => {
	it('Should handle a glob', async () => {
		const artifacts = await collectArtifacts('./files/*.uda');

		const output = buildTypes(artifacts);

	});
});

import { collectArtifacts } from './collect-artifacts';
import { getPickableTypes } from './pickable-document-type';

describe('getPickableTypes', () => {
	it('Should count root document as pickable', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/document-type__3a0918f517e14625922203299b168d11.uda');
		const documentTypes = Array.from(artifacts['document-type'].values());

		const pickable = getPickableTypes(documentTypes);
		expect(pickable).toHaveLength(1);
	});

	it('Should not count non-root document as pickable', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/document-type__1ab5ade5519e42709b4cc554968d97c9.uda');
		const documentTypes = Array.from(artifacts['document-type'].values());

		const pickable = getPickableTypes(documentTypes);
		expect(pickable).toHaveLength(0);
	});

	it('Should count documents referenced via AllowedChildContent as pickable', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/*.uda');
		const documentTypes = Array.from(artifacts['document-type'].values());

		const pickable = getPickableTypes(documentTypes);
		expect(pickable).toHaveLength(2);
	});
});

import { describe, expect, it } from 'vitest';

import { collectArtifacts } from './collect-artifacts';
import { getPickableTypes } from './pickable-document-type';

describe('getPickableTypes', () => {
	it('should count root document as pickable', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/current/document-type__8856c80b6f524f87969a863a61eaa6aa.uda');
		const documentTypes = Array.from(artifacts['document-type'].values());

		const pickable = getPickableTypes(documentTypes);
		expect(pickable).toHaveLength(1);
	});

	it('should not count non-root document as pickable', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/current/document-type__5f471833166846a4a2fbf04c1a3946a8.uda');
		const documentTypes = Array.from(artifacts['document-type'].values());

		const pickable = getPickableTypes(documentTypes);
		expect(pickable).toHaveLength(0);
	});

	it('should count documents referenced via AllowedChildContent as pickable', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/current/*.uda');
		const documentTypes = Array.from(artifacts['document-type'].values());

		const pickable = getPickableTypes(documentTypes);
		expect(pickable).toHaveLength(3);
	});
});

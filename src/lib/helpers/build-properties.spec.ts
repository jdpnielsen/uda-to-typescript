import { collectProperties } from './build-properties';
import { PropertyGroup, PropertyType } from '../types/shared';

describe('collectProperties', () => {
	it('returns an empty array for an empty MediaType', () => {
		const emptyMediaType = {
			PropertyTypes: [],
			PropertyGroups: [],
		};

		const result = collectProperties(emptyMediaType);
		expect(result).toEqual([]);
	});

	it('returns an array of PropertyTypes for a MediaType with only PropertyTypes', () => {
		const mediaType = {
			PropertyTypes: [
				{ Name: 'prop1', type: 'string' } as unknown as PropertyType,
				{ name: 'prop2', type: 'number' } as unknown as PropertyType,
			],
			PropertyGroups: [],
		};
		const result = collectProperties(mediaType);
		expect(result).toEqual(mediaType.PropertyTypes);
	});

	it('returns an array of PropertyTypes for a MediaType with PropertyTypes and PropertyGroups', () => {
		const mediaType = {
			PropertyTypes: [
				{ name: 'prop1', type: 'string' } as unknown as PropertyType,
				{ name: 'prop2', type: 'number' } as unknown as PropertyType,
			],
			PropertyGroups: [
				{
					name: 'group1',
					PropertyTypes: [
						{ name: 'prop3', type: 'boolean' },
						{ name: 'prop4', type: 'string' },
					],
				} as unknown as PropertyGroup,
				{
					name: 'group2',
					PropertyTypes: [
						{ name: 'prop5', type: 'number' },
					],
				} as unknown as PropertyGroup,
			],
		};
		const expected = [
			{ name: 'prop1', type: 'string' },
			{ name: 'prop2', type: 'number' },
			{ name: 'prop3', type: 'boolean' },
			{ name: 'prop4', type: 'string' },
			{ name: 'prop5', type: 'number' },
		];
		const result = collectProperties(mediaType);
		expect(result).toEqual(expected);
	});
});

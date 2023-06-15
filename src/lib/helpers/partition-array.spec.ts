import { partitionArray } from './partition-array';

describe('partitionArray', () => {
	it('Should return two arrays', () => {
		const [even, odd] = partitionArray([1, 2, 3, 4, 5], (value) => value % 2 === 0);
		expect(even).toHaveLength(2);
		expect(odd).toHaveLength(3);
	});
});

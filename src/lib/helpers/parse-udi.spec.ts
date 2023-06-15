import { parseUdi } from './parse-udi';
import { UDI } from '../types/utils';

describe('parseUdi', () => {
	it('Should handle a wellformed UDI', () => {
		const { type, id } = parseUdi('umb://data-type/f38f0ac71d27439c9f3f089cd8825a53');
		expect(type).toBe('data-type');
		expect(id).toBe('f38f0ac71d27439c9f3f089cd8825a53');
	});

	it('Should not care about the contents', () => {
		const { type, id } = parseUdi('umb://type/asdasd' as UDI);
		expect(type).toBe('type');
		expect(id).toBe('asdasd');
	});
});

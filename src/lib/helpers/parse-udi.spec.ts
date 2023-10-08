import { convertGuidToId, parseUdi } from './parse-udi';
import { GUID, UDI } from '../types/utils';

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

describe('convertGuidToId', () => {
	it('Should handle a wellformed GUID', () => {
		const ouout = convertGuidToId('abf4b0fc-39a3-4205-bac1-4f20991e89ed');
		expect(ouout).toBe('abf4b0fc39a34205bac14f20991e89ed');
	});

	it('Should handle a wellformed GUID without dashes', () => {
		const ouout = convertGuidToId('abf4b0fc39a34205bac14f20991e89ed' as GUID);
		expect(ouout).toBe('abf4b0fc39a34205bac14f20991e89ed');
	});
});

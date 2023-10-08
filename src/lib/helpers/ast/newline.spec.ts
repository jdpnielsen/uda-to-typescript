import { newLineAST } from './newline';

describe('newLineAST', () => {
	it('should create an identifier with a new line character', () => {
		expect(newLineAST.escapedText).toBe('\n');
	});
});

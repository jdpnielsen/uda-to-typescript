
import ts from 'typescript';
import { buildCrops } from './media-object';

describe('buildCrops', () => {
	it('should generate the expected AST', () => {
		const crops = [
			{ alias: 'square', width: 100, height: 100 },
			{ alias: 'landscape', width: 200, height: 100 },
			{ alias: 'portrait', width: 100, height: 200 },
		];
		const result = buildCrops(crops);
		const output = ts.createPrinter()
			.printList(ts.ListFormat.BarDelimited, ts.factory.createNodeArray(result), ts.createSourceFile('', '', ts.ScriptTarget.Latest));

		expect(output).toBe('Crop<"square", 100, 100> |Crop<"landscape", 200, 100> |Crop<"portrait", 100, 200>');
	});
});

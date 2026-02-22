import { describe, expect, it } from 'vitest';
import ts from 'typescript';

import { exportToken } from './export-token';

describe('exportToken', () => {
	it('should create a type reference node with Record and string/never types', () => {
		// Convert to string
		const sourceFile = ts.createSourceFile(
			'file.ts',
			'',
			ts.ScriptTarget.ESNext,
			true,
			ts.ScriptKind.TS
		)

		const printer = ts.createPrinter({});

		const outputFile = printer.printList(
			ts.ListFormat.SingleLine,
			ts.factory.createNodeArray([
				exportToken,
			]),
			sourceFile,
		);

		expect(outputFile).toEqual('export');
	});
});

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { parseTypeNode } from './parse-type';

describe('parseTypeNode', () => {
	it('should parse simple type references', () => {
		const node = parseTypeNode('UrlItem');

		const output = ts.createPrinter({ omitTrailingSemicolon: true })
			.printNode(
				ts.EmitHint.Unspecified,
				node,
				ts.createSourceFile('test.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS),
			);

		expect(output).toBe('UrlItem');
	});

	it('should parse complex union expressions', () => {
		const node = parseTypeNode('(CustomExternalLink | CustomContentLink)[]');

		const output = ts.createPrinter({ omitTrailingSemicolon: true })
			.printNode(
				ts.EmitHint.Unspecified,
				node,
				ts.createSourceFile('test.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS),
			);

		expect(output).toBe('(CustomExternalLink | CustomContentLink)[]');
	});
});

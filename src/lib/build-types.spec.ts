import { collectArtifacts } from './helpers/collect-artifacts';
import { buildTypes } from './build-types';
import ts from 'typescript';
import { readFile } from 'fs/promises';
import { dataTypeMap } from './datatypes';

describe('buildTypes', () => {
	it('Should handle a glob with no files', async () => {
		const artifacts = await collectArtifacts('./__bad_path/*.uda');

		const output = buildTypes(artifacts, dataTypeMap);
		const expected = ts.createPrinter()
			.printList(
				ts.ListFormat.SingleLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest)
			);

		expect(expected.trim())
			.toBe('import { type BaseDocumentType, type EmptyObjectType, type BaseGridBlockType, type BaseBlockType, type BaseGridBlockAreaType, type BaseBlockListType, type BaseBlockGridType, type BaseMediaType, type Crop, type MediaPickerItem } from "./base-types";');
	});

	it('Should handle a glob with files', async () => {
		const artifacts = await collectArtifacts('./src/__tests__/__fixtures__/*.uda');
		const expected = await readFile('./src/__tests__/__fixtures__/output.txt');

		const output = buildTypes(artifacts, dataTypeMap);
		const actual = ts.createPrinter()
			.printList(
				ts.ListFormat.MultiLine,
				output,
				ts.createSourceFile('', '', ts.ScriptTarget.Latest)
			);

		expect(actual).toBe(expected.toString());
	});
});

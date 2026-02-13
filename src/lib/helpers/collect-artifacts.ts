import { glob } from 'glob';
import path from 'path';
import { each as asyncEach } from 'async-parallel';
import { readFile } from 'fs/promises';
import { DataType } from '../types/data-type';
import { DocumentType } from '../types/document-type';
import { MediaType } from '../types/media-type';

// TODO: Implement culture artifact
/**
 * In-memory artifact maps keyed by normalized artifact id (UDI id without prefix).
 */
export type ArtifactContainer = {
	'data-type': Map<string, DataType>;
	'document-type': Map<string, DocumentType>;
	'media-type': Map<string, MediaType>;
};

/**
 * Collects and parses supported UDA artifacts from a glob expression.
 *
 * Files are expected to follow `<artifact-type>__<id>.uda` naming, for example
 * `data-type__f38f0ac71d27439c9f3f089cd8825a53.uda`.
 *
 * Unsupported file prefixes are ignored.
 */
export async function collectArtifacts(input: string): Promise<ArtifactContainer> {
	const filePaths = await glob(input, { ignore: 'node_modules/**' });

	const items = {
		'data-type': new Map<string, DataType>(),
		'document-type': new Map<string, DocumentType>(),
		'media-type': new Map<string, MediaType>(),
	};

	await asyncEach(filePaths, async (filePath) => {
		const { name } = path.parse(filePath);

		const [filePrefix, id] = name.split('__');

		if (!items[filePrefix as keyof ArtifactContainer]) {
			return;
		}

		const fileContents = await readFile(filePath);
		const content = JSON.parse(fileContents.toString()) as unknown;

		switch (filePrefix) {
			case 'data-type':
				items[filePrefix].set(id, content as DataType);
				break;
			case 'document-type':
				items[filePrefix].set(id, content as DocumentType);
				break;
			case 'media-type':
				items[filePrefix].set(id, content as MediaType);
				break;
		}
	});

	return items;
}

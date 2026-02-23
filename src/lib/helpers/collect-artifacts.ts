import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { glob } from 'glob';

import type { DataType } from '../types/data-type';
import type { DocumentType } from '../types/document-type';
import type { MediaType } from '../types/media-type';
import type { DataTypeContainer } from '../types/data-type-container';
import type { DocumentTypeContainer } from '../types/document-type-container';
import type { Template } from '../types/template';
import type { Language } from '../types/language';

// TODO: Implement culture artifact
/**
 * In-memory artifact maps keyed by normalized artifact id (UDI id without prefix).
 */
export interface ArtifactContainer {
	'data-type': Map<string, DataType>;
	'document-type': Map<string, DocumentType>;
	'media-type': Map<string, MediaType>;
	'template': Map<string, Template>;
	'language': Map<string, Language>;
	'document-type-container': Map<string, DataTypeContainer>;
	'data-type-container': Map<string, DocumentTypeContainer>;
}

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
		'template': new Map<string, Template>(),
		'language': new Map<string, Language>(),
		'document-type-container': new Map<string, DocumentTypeContainer>(),
		'data-type-container': new Map<string, DataTypeContainer>(),
	};

	await Promise.all(filePaths.map(async (filePath) => {
		const { name } = path.parse(filePath);

		const [filePrefix, id] = name.split('__');

		if (!items[filePrefix as keyof ArtifactContainer]) {
			return;
		}

		const fileContents = await readFile(filePath);
		const content = JSON.parse(fileContents.toString()) as unknown;
		assertSupportedArtifactVersion(content, filePath);

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
			case 'template':
				items[filePrefix].set(id, content as Template);
				break;
			case 'document-type-container':
				items[filePrefix].set(id, content as DocumentTypeContainer);
				break;
			case 'data-type-container':
				items[filePrefix].set(id, content as DataTypeContainer);
				break;
			case 'language':
				items[filePrefix].set(id, content as Language);
				break;
		}
	}));

	return items;
}

/**
 * Validates supported Umbraco artifact versions.
 *
 * The check only runs when an explicit `__version` exists, which keeps parsing
 * tolerant of partial/custom fixture payloads while still failing fast on
 * known unsupported exports.
 */
function assertSupportedArtifactVersion(content: unknown, filePath: string): void {
	if (typeof content !== 'object' || content === null || !('__version' in content)) {
		return;
	}

	const maybeArtifact = content as { __version?: unknown };
	const version = maybeArtifact.__version;

	if (typeof version !== 'string') {
		return;
	}

	const [majorVersionToken] = version.split('.');
	const majorVersion = Number.parseInt(majorVersionToken, 10);

	if (!Number.isNaN(majorVersion) && majorVersion < 17) {
		throw new Error(`Unsupported Umbraco artifact version "${version}" in "${filePath}". Ensure artifacts match the supported major.`);
	}
}

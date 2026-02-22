import { pascalCase } from 'change-case';
import ts, { factory } from 'typescript';

import { buildCrops } from '../helpers/ast/media-object';
import type { ArtifactContainer } from '../helpers/collect-artifacts';
import { parseUdi } from '../helpers/parse-udi';
import type { DataType } from '../types/data-type';
import type { MediaType } from '../types/media-type';
import type { HandlerConfig } from '.';

interface mediaPickerConfig {
	/**
	 * Comma separated list of media types which are allowed.
	 * Example: "Image,File"
	 */
	filter?: string;
	multiple: boolean;
	validationLimit: {
		min?: number;
		max?: number;
	};
	enableLocalFocalPoint: boolean;
	crops?: Crop[];
	ignoreUserStartNodes: boolean;
}

interface Crop {
	alias: string;
	label: string;
	width: number;
	height: number;
}

export const mediaPickerHandler = {
	editorAlias: 'Umbraco.MediaPicker3' as const,
	build,
	reference,
} satisfies HandlerConfig;

export function build(): ts.Node[] {
	return [];
}

// TODO: combine crop from MediaPicker3 with mediaType's crops from its Image Cropper field.
export function reference(dataType: DataType, artifacts: ArtifactContainer): ts.TypeNode {
	const config = (dataType.Configuration || {}) as Partial<mediaPickerConfig>;
	const crops = Array.isArray(config.crops)
		? config.crops
		: [];

	const allowedMediaTypes = getAllowedMediaTypes(artifacts, config.filter)
		.sort((a, b) => a.Udi.localeCompare(b.Udi));

	if (allowedMediaTypes.length === 0) {
		return factory.createArrayTypeNode(
			factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
		);
	}

	const mediaPickerItems = allowedMediaTypes.map((mediaType) => {
		return factory.createTypeReferenceNode(
			factory.createIdentifier('MediaPickerItem'),
			[
				factory.createTypeReferenceNode(
					factory.createIdentifier(pascalCase(mediaType.Alias)),
					undefined,
				),
				...(crops.length !== 0
					? [factory.createTupleTypeNode(buildCrops(crops))]
					: []
				),
			],
		);
	});

	const type = allowedMediaTypes.length === 1
		? mediaPickerItems[0]
		: factory.createUnionTypeNode(mediaPickerItems);

	return factory.createArrayTypeNode(type);
}

function getAllowedMediaTypes(artifacts: ArtifactContainer, filter: string | undefined): MediaType[] {
	const mediaTypes = Array.from(artifacts['media-type'].values());

	if (!filter) {
		return mediaTypes;
	}

	const mediaTypeMap = new Map(mediaTypes.map((mediaType) => [mediaType.Alias, mediaType]));
	const mediaTypeByUdiIdMap = new Map(mediaTypes.map((mediaType) => [
		parseUdi(mediaType.Udi).id.toLowerCase(),
		mediaType,
	]));

	const pickedMediaTypes: MediaType[] = [];
	const seen = new Set<string>();

	for (const rawFilterValue of filter.split(',')) {
		const filterValue = rawFilterValue.trim();

		if (filterValue === '') {
			continue;
		}

		const id = filterValue.replaceAll('-', '').toLowerCase();
		const mediaType = mediaTypeMap.get(filterValue) || mediaTypeByUdiIdMap.get(id);

		if (!mediaType) {
			console.warn(`Could not find media type with alias or id "${filterValue}"`);
			continue;
		}

		if (seen.has(mediaType.Udi)) {
			continue;
		}

		seen.add(mediaType.Udi);
		pickedMediaTypes.push(mediaType);
	}

	return pickedMediaTypes;
}

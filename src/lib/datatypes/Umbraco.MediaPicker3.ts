import ts, { factory } from 'typescript'
import { pascalCase } from 'change-case';


import { DataType } from '../types/data-type';
import { ArtifactContainer } from '../helpers/collect-artifacts';
import { buildCrops } from '../helpers/ast/media-object';
import { MediaType } from '../types/media-type';

import type { HandlerConfig } from '.';

type mediaPickerConfig = {
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
} satisfies HandlerConfig

export function build(): ts.Node[] {
	return [];
}

// TODO: combine crop from MediaPicker3 with mediaType's crops from its Image Cropper field.
export function reference(dataType: DataType, artifacts: ArtifactContainer): ts.TypeNode {
	const config = dataType.Configuration as mediaPickerConfig;

	const allowedMediaTypes = getAllowedMediaTypes(artifacts, config.filter)
		.sort((a, b) => a.Udi.localeCompare(b.Udi));

	const mediaPickerItems = allowedMediaTypes.map((mediaType) => {
		const crops = config.crops || [];

		return factory.createTypeReferenceNode(
			factory.createIdentifier('MediaPickerItem'),
			[
				factory.createTypeReferenceNode(
					factory.createIdentifier(pascalCase(mediaType.Alias)),
					undefined
				),
				...(crops.length !== 0
					? [factory.createTupleTypeNode(buildCrops(crops))]
					: []
				),
			]
		);
	});

	const type = allowedMediaTypes.length === 1
		? mediaPickerItems[0]
		: factory.createUnionTypeNode(mediaPickerItems);

	return factory.createArrayTypeNode(type);
}

function getAllowedMediaTypes(artifacts: ArtifactContainer, filter: string | undefined): MediaType[] {
	if (!filter) {
		return Array
			.from(artifacts['media-type'].entries())
			.map(([, mediaType]) => mediaType)
	}

	const mediaTypeMap = new Map(
		Array
			.from(artifacts['media-type'].entries())
			.map(([, mediaType]) => [mediaType.Alias, mediaType])
	);

	return filter
		.split(',')
		.map(alias => {
			const doc = mediaTypeMap.get(alias);

			if (!doc) {
				console.log('documentTypeMap', mediaTypeMap);
				throw new Error(`Document type with alias "${alias}" was not found.`);
			}

			return doc
		});
}

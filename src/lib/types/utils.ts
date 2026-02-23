export type GUID = `${string}-${string}-${string}-${string}-${string}`;

export const ARTIFACTS = [
	'data-type',
	'document-type',
	'media-type',
	'template',
	'language',
	'data-type-container',
	'document-type-container',
] as const;
export type Artifact = typeof ARTIFACTS[number];

export type UDI = `umb://${Artifact}/${string}`;
export type typedUDI<A extends Artifact> = `umb://${A}/${string}`;

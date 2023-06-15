import { BaseDocumentType, EmptyObjectType, ObjectType } from './base-types';

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
export type KeysOfBaseType<Obj extends ObjectType, BaseType> = {
	[K in keyof Obj]: Obj[K] extends BaseType
		? K
		: never;
}[keyof Obj];

/**
 * Unexpands a document type.
 * In practice this means that all properties are removed from the document type.
 */
type UnexpandDocumentType<Doc extends BaseDocumentType> = Overwrite<Doc, { properties: EmptyObjectType }>;

type ExpandableDocumentKeys<Doc extends BaseDocumentType> = KeysOfBaseType<Doc['properties'], BaseDocumentType> | KeysOfBaseType<Doc['properties'], BaseDocumentType[]>;

/**
 * Unexpands all expandable properties of a document type.
 * @param Doc The document type to unexpand.
 * @param BlackListedKeys The keys that should not be unexpanded.
 */
type UnexpandDocumentExpandables<Doc extends BaseDocumentType, BlackListedKeys extends ExpandableDocumentKeys<Doc>> = Overwrite<Doc, {
	properties: Overwrite<Doc['properties'], {
		[K in keyof Doc['properties']]: K extends BlackListedKeys
			? Doc['properties'][K]
			: Doc['properties'][K] extends BaseDocumentType
				? UnexpandDocumentType<Doc['properties'][K]>
				: Doc['properties'][K] extends BaseDocumentType[]
					? UnexpandDocumentType<Doc['properties'][K][number]>[]
					: Doc['properties'][K]
	}>;
}>;

export type ExpandParam<Doc extends BaseDocumentType> = ExpandableDocumentKeys<Doc>[] | 'all' | undefined;
export type ExpandResult<Doc extends BaseDocumentType, Param extends ExpandParam<Doc>> = Param extends undefined
	? Doc
	: Param extends 'all'
		? UnexpandDocumentExpandables<Doc, ExpandableDocumentKeys<Doc>>
		: Param extends ExpandableDocumentKeys<Doc>[]
			? Param[number] extends never
				? Doc
				: UnexpandDocumentExpandables<Doc, Param[number]>
			: Doc;

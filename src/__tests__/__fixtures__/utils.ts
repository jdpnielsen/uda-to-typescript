import { BaseBlockGridType, BaseBlockListType, BaseBlockType, BaseDocumentType, BaseGridBlockType, EmptyObjectType, ObjectType } from './base-types';

type KeysOfBaseType<Obj extends ObjectType, BaseType> = {
	[K in keyof Obj]: NonNullable<Obj[K]> extends BaseType
		? K
		: never;
}[keyof Obj];

/**
 * Unexpands a document type.
 * In practice this means that all properties are removed from the document type.
 */
type UnexpandDocumentType<Doc extends BaseDocumentType> = Doc extends unknown
	? BaseDocumentType<Doc['contentType'], EmptyObjectType, Doc['cultures']>
	: never;

type MaybeUnexpand<U extends BaseDocumentType | null> = U extends null
	? null
	: UnexpandDocumentType<NonNullable<U>>;

type MaybeUnexpandDoc<Doc extends BaseDocumentType | null, BlackListedKeys extends ExpandableDocumentKeys<NonNullable<Doc>> | undefined> = Doc extends null
	? null
	: NonNullable<Doc> extends BaseDocumentType<string, EmptyObjectType, EmptyObjectType>
		? BaseDocumentType<string, EmptyObjectType, EmptyObjectType>
		: UnexpandDocumentExpandables<NonNullable<Doc>, BlackListedKeys>;

type UnexpandBlockList<BlockList extends BaseBlockListType, BlackListedKeys extends ExpandableDocumentKeys<BlockList['items'][number]['content']> | undefined> = BaseBlockListType<
	BaseBlockType<
		UnexpandDocumentExpandables<BlockList['items'][number]['content'], BlackListedKeys>,
		BlockList['items'][number]['settings'] extends null
			? null
			: UnexpandDocumentExpandables<NonNullable<BlockList['items'][number]['settings']>, BlackListedKeys>
	>
>;

// TODO: Handle settings, UnexpandDocumentType<BlockList['items'][number]['settings']>>
type UnexpandBlockGrid<BlockGrid extends BaseBlockGridType, BlackListedKeys extends ExpandableDocumentKeys<BlockGrid['items'][number]['content']> | undefined> = BaseBlockGridType<
	BaseGridBlockType<
		UnexpandDocumentExpandables<BlockGrid['items'][number]['content'], BlackListedKeys>
	>
>;

type ExpandableDocumentKeys<Doc extends BaseDocumentType> = Doc extends unknown ?
	KeysOfBaseType<Doc['properties'], BaseDocumentType>
	| KeysOfBaseType<Doc['properties'], BaseDocumentType[]>
	| KeysOfBaseType<Doc['properties'], BaseBlockListType>
	| KeysOfBaseType<Doc['properties'], BaseBlockGridType>
	: never;

/**
 * Unexpands all expandable properties of a document type.
 * @param Doc The document type to unexpand.
 * @param BlackListedKeys The keys that should not be unexpanded.
 */
type UnexpandDocumentExpandables<Doc extends BaseDocumentType, BlackListedKeys extends ExpandableDocumentKeys<Doc> | undefined> = Doc extends unknown
	? BaseDocumentType<Doc['contentType'], {
		[K in keyof Doc['properties']]: K extends BlackListedKeys
			// Unexpand document's properties
			? Doc['properties'][K] extends BaseDocumentType | null
				// By setting the blacklist to undefined, we can limit the expand to the top level properties.
				// Note that we are using UnexpandDocumentExpandables here, instead of UnexpandDocumentType.
				? MaybeUnexpandDoc<Doc['properties'][K], ExpandableDocumentKeys<NonNullable<Doc['properties'][K]>>>
				: Doc['properties'][K] extends BaseDocumentType[]
					? UnexpandDocumentExpandables<Doc['properties'][K][number], ExpandableDocumentKeys<Doc['properties'][K][number]>>[]
					: Doc['properties'][K] extends BaseBlockGridType
						? UnexpandBlockGrid<Doc['properties'][K], ExpandableDocumentKeys<Doc['properties'][K]['items'][number]['content']>>
						: Doc['properties'][K] extends BaseBlockListType
							? UnexpandBlockList<Doc['properties'][K], ExpandableDocumentKeys<Doc['properties'][K]['items'][number]['content']>>
							: Doc['properties'][K]
			// Unexpand Directly
			: Doc['properties'][K] extends BaseDocumentType | null
				? MaybeUnexpand<Doc['properties'][K]>
				: Doc['properties'][K] extends BaseDocumentType[]
					? UnexpandDocumentType<Doc['properties'][K][number]>[]
					: Doc['properties'][K] extends BaseBlockGridType
						? UnexpandBlockGrid<Doc['properties'][K], undefined>
						: Doc['properties'][K] extends BaseBlockListType
							? UnexpandBlockList<Doc['properties'][K], undefined>
							: Doc['properties'][K]
	}>
	: never;

export type ExpandParam<Doc extends BaseDocumentType> = ExpandableDocumentKeys<Doc>[] | 'all' | undefined | [];
export type ExpandResult<Doc extends BaseDocumentType, Param extends ExpandParam<Doc>> = Param extends [] | undefined
	? UnexpandDocumentExpandables<Doc, undefined>
	: Param extends 'all'
		? UnexpandDocumentExpandables<Doc, ExpandableDocumentKeys<Doc>>
		: Param extends ExpandableDocumentKeys<Doc>[]
			? Param[number] extends never
				? Doc
				: UnexpandDocumentExpandables<Doc, Param[number]>
			: Doc;

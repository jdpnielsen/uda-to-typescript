import { BaseBlockGridType, BaseBlockListType, BaseBlockType, BaseMediaType, BaseDocumentType, BaseGridBlockType, EmptyObjectType, ObjectType } from './base-types';

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
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

/**
 * Unexpands a media type.
 * In practice this means that all properties are removed from the document type.
 */
export type UnexpandMediatType<Media extends BaseMediaType> = Media extends unknown
	? Overwrite<Media, { properties: EmptyObjectType }>
	: never;

type MaybeUnexpand<U extends BaseDocumentType | null> = U extends null
	? null
	: UnexpandDocumentType<NonNullable<U>>;

type MaybeUnexpandDoc<Doc extends BaseDocumentType | null, BlackListedKeys extends ExpandableDocumentKeys<NonNullable<Doc>> | undefined> = Doc extends null
	? null
	: NonNullable<Doc> extends BaseDocumentType<string, EmptyObjectType, EmptyObjectType>
		? BaseDocumentType<string, EmptyObjectType, EmptyObjectType>
		: UnexpandDocumentExpandables<NonNullable<Doc>, BlackListedKeys>;

export type UnexpandBlockList<BlockList extends BaseBlockListType, BlackListedKeys extends ExpandableDocumentKeys<BlockList['items'][number]['content']> | undefined> = BaseBlockListType<
	BaseBlockType<
		UnexpandDocumentExpandables<BlockList['items'][number]['content'], BlackListedKeys>,
		BlockList['items'][number]['settings'] extends null
			? null
			: UnexpandDocumentExpandables<NonNullable<BlockList['items'][number]['settings']>, BlackListedKeys>
	>
>;

export type UnexpandBlockGrid<
	BlockGrid extends BaseBlockGridType,
	BlackListedContentKeys extends ExpandableDocumentKeys<BlockGrid['items'][number]['content']> | undefined,
	BlackListedSettingsKeys extends ExpandableDocumentKeys<NonNullable<BlockGrid['items'][number]['settings']>> | undefined
> = BaseBlockGridType<
	BaseGridBlockType<
		UnexpandDocumentExpandables<BlockGrid['items'][number]['content'], BlackListedContentKeys>,
		BlockGrid['items'][number]['settings'] extends null
			? null
			: UnexpandDocumentExpandables<NonNullable<BlockGrid['items'][number]['settings']>, BlackListedSettingsKeys>
	>
>;

type ExpandableDocumentKeys<Doc extends BaseDocumentType> = Doc extends unknown
	? ExpandablePropertyKeys<Doc['properties']>
	: never;

type ExpandablePropertyKeys<Properties extends ObjectType> = Properties extends unknown
	? KeysOfBaseType<Properties, BaseDocumentType>
		| KeysOfBaseType<Properties, BaseDocumentType[]>
		| KeysOfBaseType<Properties, BaseBlockListType>
		| KeysOfBaseType<Properties, BaseBlockGridType>
		| KeysOfBaseType<Properties, BaseMediaType>
		| KeysOfBaseType<Properties, BaseMediaType[]>
	: never;

type UnexpandNestedProperty<Prop> = Prop extends BaseDocumentType | null
	// By setting the blacklist to undefined, we can limit the expand to the top level properties.
	// Note that we are using UnexpandDocumentExpandables here, instead of UnexpandDocumentType.
	? MaybeUnexpandDoc<Prop, ExpandableDocumentKeys<NonNullable<Prop>>>
	: Prop extends BaseDocumentType[]
		? UnexpandDocumentExpandables<Prop[number], ExpandableDocumentKeys<Prop[number]>>[]
		: Prop extends BaseBlockGridType
			? UnexpandBlockGrid<Prop, ExpandableDocumentKeys<Prop['items'][number]['content']>, ExpandableDocumentKeys<NonNullable<Prop['items'][number]['settings']>>>
			: Prop extends BaseBlockListType
				? UnexpandBlockList<Prop, ExpandableDocumentKeys<Prop['items'][number]['content']>>
				: Prop

type UnexpandProperty<Prop> = Prop extends BaseDocumentType | null
	? MaybeUnexpand<Prop>
	: Prop extends BaseDocumentType[]
		? UnexpandDocumentType<Prop[number]>[]
		: Prop extends BaseBlockGridType
			? UnexpandBlockGrid<Prop, undefined, undefined>
			: Prop extends BaseBlockListType
				? UnexpandBlockList<Prop, undefined>
				: Prop extends BaseMediaType
					? UnexpandMediatType<Prop>
					: Prop extends BaseMediaType[]
						? UnexpandMediatType<Prop[number]>[]
						: Prop

/**
 * Unexpands all expandable properties.
 * @param Doc The document properties to unexpand.
 * @param BlackListedKeys The keys that should not be unexpanded.
 */
type UnexpandPropertyExpandables<Doc extends ObjectType, BlackListedKeys extends ExpandablePropertyKeys<Doc> | undefined> = {
	[K in keyof Doc]: K extends BlackListedKeys
		? UnexpandNestedProperty<Doc[K]>
		: UnexpandProperty<Doc[K]>
};

/**
 * Unexpands all expandable properties of a document type.
 * @param Doc The document type to unexpand.
 * @param BlackListedKeys The keys that should not be unexpanded.
 */
type UnexpandDocumentExpandables<Doc extends BaseDocumentType, BlackListedKeys extends ExpandableDocumentKeys<Doc> | undefined> = Doc extends unknown
	? BaseDocumentType<Doc['contentType'], UnexpandPropertyExpandables<Doc['properties'], BlackListedKeys>>
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

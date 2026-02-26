import type { BaseBlockGridType, BaseBlockListType, BaseBlockType, BaseDocumentType, BaseElementType, BaseGridBlockType, BaseMediaType, EmptyObjectType, ObjectType } from './base-types';
import type { UmbracoForm } from './form';

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
export type UnexpandDocumentType<Doc extends BaseDocumentType> = Doc extends unknown
	? BaseDocumentType<Doc['contentType'], EmptyObjectType, Doc['cultures']>
	: never;

/**
 * Unexpands a media type.
 * In practice this means that all properties are removed from the media type.
 */
export type UnexpandMediaType<Media extends BaseMediaType> = Media extends unknown
	? Overwrite<Media, { properties: EmptyObjectType }>
	: never;

type MaybeUnexpand<U extends BaseDocumentType | null> = U extends null
	? null
	: UnexpandDocumentType<NonNullable<U>>;

type MaybeUnexpandDoc<Doc extends BaseDocumentType | null, BlackListedKeys extends ExpandableElementKeys<NonNullable<Doc>> | undefined> = Doc extends null
	? null
	: NonNullable<Doc> extends BaseDocumentType<string, EmptyObjectType, EmptyObjectType>
		? BaseDocumentType<string, EmptyObjectType, EmptyObjectType>
		: UnexpandDocumentExpandables<NonNullable<Doc>, BlackListedKeys>;

export type UnexpandBlock<Block extends BaseBlockType, BlackListedKeys extends ExpandableBlockKeys<NonNullable<Block>> | undefined> = Block extends unknown
	? BaseBlockType<
		UnexpandElementExpandables<Block['content'], BlackListedKeys>,
		Block['settings'] extends BaseElementType
			? UnexpandElementExpandables<Block['settings'], BlackListedKeys>
			: null
	>
	: never;

export type UnexpandBlockList<
	BlockList extends BaseBlockListType,
	BlackListedKeys extends ExpandableBlockKeys<BlockList['items'][number]> | undefined,
> = BaseBlockListType<
	UnexpandBlock<BlockList['items'][number], BlackListedKeys>
>;

export type UnexpandBlockGrid<
	BlockGrid extends BaseBlockGridType,
	BlackListedKeys extends ExpandableBlockKeys<BlockGrid['items'][number]> | undefined,
> = BaseBlockGridType<
	BaseGridBlockType<
		UnexpandElementExpandables<BlockGrid['items'][number]['content'], BlackListedKeys>,
		BlockGrid['items'][number]['settings'] extends null
			? null
			: UnexpandElementExpandables<NonNullable<BlockGrid['items'][number]['settings']>, BlackListedKeys>,
		BlockGrid['items'][number]['areas']
	>
>;

/**
 * Gets all expandable properties of an element type.
 * @param Elm The element to get the expandable keys from.
 * @returns The expandable keys.
 * @example
 * ```ts
 * type Page = BaseDocumentType<'page', {
 * 	foo: BaseDocumentType;
 * 	bar: BaseDocumentType[];
 * 	baz: string;
 * }>;
 *
 * type ExpandableKeys = ExpandableElementKeys<Page>;
 * // type ExpandableKeys = 'foo' | 'bar';
 * ```
 */
export type ExpandableElementKeys<Elm extends BaseElementType> = Elm extends unknown
	? ExpandablePropertyKeys<Elm['properties']>
	: never;

/**
 * Gets all expandable properties of a block type.
 * Note that this is a single list for a Block content & settings even though they are structurally divided.
 * See below [Umbraco property expansion docs](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/property-expansion-and-limiting#working-with-block-based-editors) for more.
 */
export type ExpandableBlockKeys<Block extends BaseBlockType> = Block extends unknown
	? Block['settings'] extends BaseElementType
		? ExpandableElementKeys<Block['content']> | ExpandableElementKeys<Block['settings']>
		: ExpandableElementKeys<Block['content']>
	: never;

/**
 * Gets all expandable properties of an object.
 * @param Properties The properties to get the expandable keys from.
 * @returns The expandable keys.
 * @example
 * ```ts
 * type PropObject = {
 * 	foo: BaseDocumentType;
 * 	bar: BaseDocumentType[];
 * 	baz: string;
 * };
 *
 * type ExpandableKeys = ExpandablePropertyKeys<PropObject>;
 * // type ExpandableKeys = 'foo' | 'bar';
 * ```
 */
export type ExpandablePropertyKeys<Properties extends ObjectType> = Properties extends unknown
	? KeysOfBaseType<Properties, BaseDocumentType>
	| KeysOfBaseType<Properties, BaseDocumentType[]>
	| KeysOfBaseType<Properties, BaseBlockListType>
	| KeysOfBaseType<Properties, BaseBlockType>
	| KeysOfBaseType<Properties, { form: UmbracoForm }>
	| KeysOfBaseType<Properties, { form: UmbracoForm }[]>
	| KeysOfBaseType<Properties, UmbracoForm>
	| KeysOfBaseType<Properties, BaseBlockGridType>
	| KeysOfBaseType<Properties, BaseMediaType>
	| KeysOfBaseType<Properties, BaseMediaType[]>
	: never;

type UnexpandNestedProperty<Prop> = Prop extends BaseDocumentType | null
	// By setting the blacklist to undefined, we can limit the expand to the top level properties.
	// Note that we are using UnexpandDocumentExpandables here, instead of UnexpandDocumentType.
	? MaybeUnexpandDoc<Prop, ExpandableElementKeys<NonNullable<Prop>>>
	: Prop extends BaseDocumentType[]
		? UnexpandDocumentExpandables<Prop[number], ExpandableElementKeys<Prop[number]>>[]
		: Prop extends BaseBlockGridType
			? UnexpandBlockGrid<Prop, ExpandableBlockKeys<Prop['items'][number]>>
			: Prop extends BaseBlockListType
				? UnexpandBlockList<Prop, ExpandableBlockKeys<Prop['items'][number]>>
				: Prop;

export type UnexpandProperty<Prop> = Prop extends BaseDocumentType | null
	? MaybeUnexpand<Prop>
	: Prop extends BaseDocumentType[]
		? UnexpandDocumentType<Prop[number]>[]
		: Prop extends BaseBlockGridType
			? UnexpandBlockGrid<Prop, undefined>
			: Prop extends BaseBlockListType
				? UnexpandBlockList<Prop, undefined>
				: Prop extends BaseBlockType
					? UnexpandBlock<Prop, undefined>
					: Prop extends BaseMediaType
						? UnexpandMediaType<Prop>
						: Prop extends BaseMediaType[]
							? UnexpandMediaType<Prop[number]>[]
							: Prop extends { form: UmbracoForm }
								? Overwrite<Prop, { form: null }>
								: Prop extends { form: UmbracoForm }[]
									? Overwrite<Prop[number], { form: null }>[]
									: Prop extends UmbracoForm
										? Overwrite<Prop, { form: null }>
										: Prop;

/**
 * Unexpands all expandable properties.
 * @param Doc The document properties to unexpand.
 * @param BlackListedKeys The keys that should not be unexpanded.
 */
export type UnexpandPropertyExpandables<Doc extends ObjectType, BlackListedKeys extends ExpandablePropertyKeys<Doc> | undefined> = {
	[K in keyof Doc]: K extends BlackListedKeys
		? UnexpandNestedProperty<Doc[K]>
		: UnexpandProperty<Doc[K]>
};

/**
 * Unexpands all expandable properties of an element type.
 * @param Elm The element type to unexpand.
 * @param BlackListedKeys The keys that should not be unexpanded.
 */
export type UnexpandElementExpandables<Elm extends BaseElementType, BlackListedKeys extends ExpandableElementKeys<Elm> | undefined> = Elm extends unknown
	? BaseElementType<Elm['contentType'], UnexpandPropertyExpandables<Elm['properties'], BlackListedKeys>>
	: never;

/**
 * Unexpands all expandable properties of a document type.
 * @param Doc The document type to unexpand.
 * @param BlackListedKeys The keys that should not be unexpanded.
 */
export type UnexpandDocumentExpandables<Doc extends BaseDocumentType, BlackListedKeys extends ExpandableElementKeys<Doc> | undefined> = Doc extends unknown
	? BaseDocumentType<Doc['contentType'], UnexpandPropertyExpandables<Doc['properties'], BlackListedKeys>, Doc['cultures']>
	: never;

export type ExpandParam<Doc extends BaseDocumentType> = ExpandableElementKeys<Doc>[] | '$all' | undefined | [];
export type ExpandResult<Doc extends BaseDocumentType, Param extends ExpandParam<Doc>> = Param extends [] | undefined
	? UnexpandDocumentExpandables<Doc, undefined>
	: Param extends '$all'
		? UnexpandDocumentExpandables<Doc, ExpandableElementKeys<Doc>>
		: Param extends ExpandableElementKeys<Doc>[]
			? Param[number] extends never
				? Doc
				: UnexpandDocumentExpandables<Doc, Param[number]>
			: Doc;

type DocFields<T extends BaseElementType> = keyof T['properties'];

export type Fields<T extends BaseElementType> = ['$all'] | (DocFields<T> | {
	[K in Exclude<ExpandableElementKeys<T>, undefined>]?: NonNullable<T['properties'][K]> extends BaseElementType[]
		? Fields<NonNullable<T['properties'][K]>[number]>
		: NonNullable<T['properties'][K]> extends BaseElementType
			? Fields<NonNullable<T['properties'][K]>>
			: never;
})[];

export type OmitFields<T extends BaseDocumentType, K extends Fields<T>> = K extends ['$all']
	? T
	: BaseDocumentType<
		T['contentType'],
		Pick<T['properties'], K extends [DocFields<T>] ? K[number] : never>,
		T['cultures']
	>;

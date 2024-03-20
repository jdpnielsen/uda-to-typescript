import { BaseDocumentType, EmptyObjectType, ReferencedDocument } from './base-types';
import { APage } from './test-types';

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

type OverwriteDocument<T extends BaseDocumentType, U> = Overwrite<T, {
	properties: Overwrite<T['properties'], U>
}>;

type ExpandableDocumentKeys<T extends BaseDocumentType> = NonNullable<{
	// TODO: Handle media and form
	[K in keyof T['properties']]: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>
		? K
		: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>[]
			? K
			: never;
}[keyof T['properties']]>;

type AllFields = '$all';

type ExpandableNestedDocumentKeys<T extends BaseDocumentType> = {
	'$all'?:  AllFields
	| {
		[K in keyof T['properties']]?: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>
			// This handles BaseDocumentType
			? ExpandableDocumentKeys<NonNullable<T['properties'][K]>['_hidden']>
			: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>[]
				// This handles BaseDocumentType[]
				? ExpandableDocumentKeys<NonNullable<T['properties'][K]>[number]['_hidden']>
				: never;
		// TODO Handle BlockList, BlockGrid, Media, Media[] & Form.
	}[keyof T['properties']]
	| {
		[K in keyof T['properties']]?: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>
			// This handles BaseDocumentType
			? ExpandableNestedDocumentKeys<NonNullable<T['properties'][K]>['_hidden']>
			: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>[]
				// This handles BaseDocumentType[]
				? ExpandableNestedDocumentKeys<NonNullable<T['properties'][K]>[number]['_hidden']>
				: never;
		// TODO Handle BlockList, BlockGrid, Media, Media[] & Form.
	}[keyof T['properties']]
} & {
	[K in (ExpandableDocumentKeys<T>)]?: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>
		// This handles BaseDocumentType
		? AllFields | ExpandableDocumentKeys<NonNullable<T['properties'][K]>['_hidden']> | ExpandableNestedDocumentKeys<NonNullable<T['properties'][K]>['_hidden']>
		: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>[]
			// This handles BaseDocumentType[]
			? AllFields | ExpandableDocumentKeys<NonNullable<T['properties'][K]>[number]['_hidden']> | ExpandableNestedDocumentKeys<NonNullable<T['properties'][K]>[number]['_hidden']>
			: never;
	// TODO Handle BlockList, BlockGrid, Media, Media[] & Form.
};

/**
 * If property is optional, handle nested operations, but return a union type with undefined
 */
type ForwardOptional<T> = T extends unknown | undefined
	? T | undefined
	: T;

type ForwardOptionalByBase<Base, T> = Base extends unknown | undefined
	? T | undefined
	: T;

type ExpandDoc<T extends BaseDocumentType, K extends ExpandableDocumentKeys<T> | undefined> = T extends unknown
	? Overwrite<T, {
		properties: Overwrite<T['properties'], {
			[P in keyof T['properties']]: K extends ExpandableDocumentKeys<T>
				? P extends K
					? ForwardOptional<ExpandPropertyByKey<T, P>>
					: P extends ExpandableDocumentKeys<T>
						? ForwardOptional<CleanPropertyByKey<T, P>>
						: T['properties'][K]
				: P extends ExpandableDocumentKeys<T>
					? ForwardOptional<CleanPropertyByKey<T, P>>
					: T['properties'][P]
		}>
	}>
	: never;

type ExpandField<T, K extends ExpandableNestedPropertyKeys<T>> = T extends unknown
	? T extends BaseDocumentType
		? T extends ReferencedDocument<BaseDocumentType>
			? ForwardOptionalByBase<T, ExpandDoc<T['_hidden'], K>>
			: ForwardOptionalByBase<T, ExpandDoc<T, K>>
		: T extends BaseDocumentType[]
			? T extends ReferencedDocument<BaseDocumentType>[]
				? ForwardOptionalByBase<T, ExpandDoc<T[number]['_hidden'], K>[]>
				: ForwardOptionalByBase<T, ExpandDoc<T[number], K>[]>
			: '1 No expansion found'
	: '2 No expansion found'

type ExpandableNestedPropertyKeys<T> = T extends unknown
	? T extends BaseDocumentType
		? T extends ReferencedDocument<BaseDocumentType>// ExpandableTopLevelDocumentKeys<T>
			? ExpandableDocumentKeys<T['_hidden']>
			: ExpandableDocumentKeys<T>
		: T extends BaseDocumentType[]
			? T extends ReferencedDocument<BaseDocumentType>[]
				? ExpandableDocumentKeys<T[number]['_hidden']>
				: ExpandableDocumentKeys<T[number]>
			: never
	: never;

type ExpandPropertyByKey<T extends BaseDocumentType, K extends keyof T['properties']> = T extends unknown
	? NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>
		? ExpandReferencedDocument<NonNullable<T['properties'][K]>>
		: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>[]
			? ExpandReferencedDocument<NonNullable<T['properties'][K]>[number]>[]
			: NonNullable<T['properties'][K]>
	: never;

type ExpandReferencedDocument<T extends ReferencedDocument<BaseDocumentType>> = T extends unknown
	? T extends ReferencedDocument<BaseDocumentType>
		? ExpandOrCleanDocumentByKey<T['_hidden'], undefined>
		: never
	: never;

type CleanPropertyByKey<T extends BaseDocumentType, K extends keyof T['properties']> = T extends unknown
	? NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>
		? CleanReferencedDocument<NonNullable<T['properties'][K]>>
		: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>[]
			? CleanReferencedDocument<NonNullable<T['properties'][K]>[number]>[]
			: T['properties'][K]
	: never;

type CleanReferencedDocument<T extends ReferencedDocument<BaseDocumentType>> = T extends ReferencedDocument<BaseDocumentType>
	? Omit<T, '_hidden'>
	: never;

type ExpandOrCleanDocumentByKey<T extends BaseDocumentType, K extends ExpandableDocumentKeys<T> | undefined> = OverwriteDocument<T, {
	[P in keyof T['properties']]: P extends ExpandableDocumentKeys<T>
		? P extends K
			? ExpandPropertyByKey<T, P>
			: CleanPropertyByKey<T, P>
		: T['properties'][P]
}>

type ExpandNestedPropertyByKey<T, K extends ExpandableNestedPropertyKeys<T>> = T extends unknown
	? T extends BaseDocumentType
		? K extends keyof T['properties']
			? NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>
				// TODO: Clean nested properties
				? ExpandOrCleanDocumentByKey<NonNullable<T['properties'][K]>['_hidden'], ExpandableDocumentKeys<NonNullable<T['properties'][K]>['_hidden']>>
				: NonNullable<T['properties'][K]> extends ReferencedDocument<BaseDocumentType>[]
					? ExpandOrCleanDocumentByKey<NonNullable<T['properties'][K]>[number]['_hidden'], ExpandableDocumentKeys<NonNullable<T['properties'][K]>[number]['_hidden']>>[]
					: 'aa'
			: 'b'
		: T extends BaseDocumentType[]
			? K extends keyof T[number]['properties']
				? NonNullable<T[number]['properties'][K]> extends ReferencedDocument<BaseDocumentType>
					? '3' //ExpandField<NonNullable<T[number]['properties'][K]>>
					: '5'
				: '6'
			: `7 ${K}`
	: never;

export type ExpandNestedProperty<T extends BaseDocumentType, K extends ExpandableNestedDocumentKeys<T>> = T extends unknown
	? K extends Record<string, Record<string, unknown>>
		// x.x -> x
		? keyof K extends AllFields
			// '$all.$all -> x'
			? K[AllFields] extends ExpandableNestedDocumentKeys<T>['$all']
				? OverwriteDocument<T, {
					[P in keyof T['properties']]: P extends ExpandableDocumentKeys<T>
						// ? ExpandNestedProperty<T, K[AllFields]>
						? K[AllFields] extends ExpandableNestedNestedKeys<T['properties'][P]>
							? ExpandNestedNested<NonNullable<T['properties'][P]>, K[AllFields]>
							: 'no'
						: T['properties'][P]
				}>
				: never
			: 'prop.x -> x'
		// x -> x
		: keyof K extends AllFields
			? K[AllFields] extends AllFields
				// 'all -> all'
				? OverwriteDocument<T, {
					[P in keyof T['properties']]: P extends ExpandableDocumentKeys<T>
						? ExpandNestedPropertyByKey<ExpandDoc<T, P>, NonNullable<ExpandableNestedPropertyKeys<ExpandDoc<T, P>>>>
						: T['properties'][P]
				}>
				// 'all -> prop'
				: K[AllFields] extends ExpandableNestedPropertyKeys<NonNullable<T['properties'][ExpandableNestedPropertyKeys<T>]>>
					? ExpandNestedDocByKey<T, ExpandableNestedPropertyKeys<T>, K[AllFields]>
					: never
			// 'prop -> prop | all'
			: keyof K extends ExpandableDocumentKeys<T>
				? OverwriteDocument<T, {
					[P in keyof T['properties']]: P extends ExpandableDocumentKeys<T>
						? P extends keyof K
							// 'prop' -> 'all'
							? K[P] extends AllFields
								? ExpandNestedPropertyByKey<ExpandDoc<T, P>, NonNullable<ExpandableNestedPropertyKeys<ExpandDoc<T, P>>>>
								// 'prop' -> 'prop'
								: P extends ExpandableNestedPropertyKeys<T>
									? K[P] extends ExpandableNestedPropertyKeys<NonNullable<T['properties'][P]>>
										? ExpandNestedDocByKey<T, P, K[P]>['properties'][P]
										: never
									: never
							: ExpandDoc<T, undefined>['properties'][P]
						: T['properties'][P]
				}>
				: never
	: never;

type ExpandableNestedNestedKeys<T> = T extends unknown
	? T extends BaseDocumentType
		? T extends ReferencedDocument<BaseDocumentType>// ExpandableTopLevelDocumentPKeys<T>
			? ExpandableNestedDocumentKeys<T['_hidden']>
			: ExpandableNestedDocumentKeys<T>
		: T extends BaseDocumentType[]
			? T extends ReferencedDocument<BaseDocumentType>[]
				? ExpandableNestedDocumentKeys<T[number]['_hidden']>
				: ExpandableNestedDocumentKeys<T[number]>
			: never
	: never;

type ExpandNestedNested<T, Y extends ExpandableNestedNestedKeys<T>> = T extends unknown
	? T extends BaseDocumentType
		? T extends ReferencedDocument<BaseDocumentType>// ExpandableTopLevelDocumentKeys<T>
			? ExpandNestedProperty<T['_hidden'], Y>
			: ExpandNestedProperty<T, Y>
		: T extends BaseDocumentType[]
			? T extends ReferencedDocument<BaseDocumentType>[]
				? ExpandNestedProperty<T[number]['_hidden'], Y>[]
				: ExpandNestedProperty<T[number], Y>[]
			: never
	: never;

type ExpandNestedDocByKey<
	T extends BaseDocumentType,
	K extends ExpandableNestedPropertyKeys<T>,
	N extends ExpandableNestedPropertyKeys<NonNullable<T['properties'][K]>>,
	Base extends ExpandOrCleanDocumentByKey<T, K> = ExpandOrCleanDocumentByKey<T, K>
> = OverwriteDocument<Base, {
	[E in keyof Base['properties']]: E extends K
		? ExpandField<NonNullable<T['properties'][E]>, N>
		: Base['properties'][E];
}>

// TODO $all.$all -> prop -- YOU ARE HERE
type AllAllProp = ExpandNestedProperty<APage, {
	$all: {
		'bPage_single': {
			'cPage_single': {
				'$all': '$all'
			}
		}
	}
}>;

const allAllProp: AllAllProp = {} as AllAllProp;
// hmm. Closer now!
allAllProp.properties.aPage_single?.properties.bPage_single?.contentType satisfies 'cPage' | undefined;
allAllProp.properties.aPage_single?.properties.bPage_multi?.[0].contentType satisfies 'cPage' | undefined;
allAllProp.properties.aPage_single?.properties.bPage_multi?.[0].properties satisfies EmptyObjectType | undefined

allAllProp.properties.aPage_multi?.[0].properties.bPage_multi?.[0].properties satisfies EmptyObjectType | undefined
allAllProp.properties.aPage_multi?.[0].properties.bPage_single?.properties.cPage_single?.properties.propValue satisfies string | undefined

/* type AllProp = ExpandNestedProperty<ContentPage, {
	$all: 'ref'
}>;

const allProp: AllProp = {} as AllProp;

allProp.properties.meta_description satisfies string | undefined
allProp.properties.ref?.properties.meta_description satisfies string | undefined
allProp.properties.ref?.properties.ref?.properties.meta_description satisfies string | undefined
allProp.properties.ref?.properties.ref?.properties.ref?.properties satisfies EmptyObjectType | undefined
allProp.properties.ref?.properties.test?.[0].properties.ref?.properties satisfies EmptyObjectType | undefined
allProp.properties.test?.[0].properties.test?.[0].properties satisfies EmptyObjectType | undefined
 */
/*
// $all.$all -> $all
type AllAllAll = ExpandNestedProperty<ContentPage, {
	$all: {
		'$all': '$all'
	}
}>;

const allAllAll: AllAllAll = {} as AllAllAll;

allAllAll.properties.test?.[0].properties

allAllAll.properties.ref?.properties.meta_title satisfies string | undefined
allAllAll.properties.ref?.properties.ref?.properties.meta_title satisfies string | undefined
allAllAll.properties.ref?.properties.ref?.properties.ref?.properties.ref?.properties satisfies EmptyObjectType | undefined
allAllAll.properties.ref?.properties.test?.[0].properties.ref?.properties?.ref?.properties satisfies EmptyObjectType | undefined
allAllAll.properties.ref?.properties.test?.[0].properties.test?.[0].properties.ref?.properties satisfies EmptyObjectType | undefined
 */

/*
// prop -> [Prop]
type PropProp = ExpandNestedProperty<ContentPage, {
	ref: 'test'
}>;

const propProp: PropProp = {} as PropProp;

propProp.properties.ref
propProp.properties.ref?.properties.ref?.properties.meta_title satisfies string | undefined
propProp.properties.ref?.properties.ref?.properties.ref?.properties satisfies EmptyObjectType | undefined
propProp.properties.ref?.properties.test?.[0].properties.ref?.properties satisfies EmptyObjectType | undefined
propProp.properties.ref?.properties.test?.[0].properties.test?.[0].properties satisfies EmptyObjectType | undefined
propProp.properties.test?.[0]?.properties satisfies EmptyObjectType | undefined
// test.properties.ref = undefined
// test.properties.[0].properties.ref[0].properties.ref[0].properties.meta_title;

propProp.properties.meta_description satisfies string | undefined
propProp.properties.ref?.properties.meta_description satisfies string | undefined
propProp.properties.ref?.properties.ref?.properties.meta_description satisfies string | undefined
propProp.properties.ref?.properties.ref?.properties.ref?.properties satisfies EmptyObjectType | undefined
propProp.properties.ref?.properties.test?.[0].properties.ref?.properties satisfies EmptyObjectType | undefined
propProp.properties.test?.[0].properties satisfies EmptyObjectType | undefined

// prop -> All
type PropAll = ExpandNestedProperty<ContentPage, {
	'ref': '$all'
}>;

const propAll: PropAll = {} as PropAll;
propAll.properties.test?.[0].properties
propAll.properties.test?.[0]?.properties satisfies EmptyObjectType | undefined
// test.properties.ref = undefined
// test.properties.[0].properties.ref[0].properties.ref[0].properties.meta_title;

if (propAll.properties.test?.[0].properties.test?.[0] && propAll.properties.ref?.properties.ref?.properties.ref?.properties) {

	propAll.properties.meta_description satisfies string | undefined
	propAll.properties.ref.properties.meta_description satisfies string | undefined
	propAll.properties.ref.properties.ref.properties.meta_description satisfies string | undefined
	propAll.properties.ref.properties.ref.properties.ref.properties satisfies EmptyObjectType
	propAll.properties.ref.properties.test?.[0].properties.ref?.properties satisfies EmptyObjectType | undefined
	propAll.properties.test[0].properties satisfies EmptyObjectType
}

// all -> Prop
type AllProp = ExpandNestedProperty<ContentPage, {
	$all: 'ref'
}>;

const allProp: AllProp = {} as AllProp;

// test.properties.ref = undefined
// test.properties.[0].properties.ref[0].properties.ref[0].properties.meta_title;

if (allProp.properties.test?.[0].properties.test?.[0] && allProp.properties.ref?.properties.ref?.properties.ref?.properties) {

	allProp.properties.meta_description satisfies string | undefined
	allProp.properties.ref.properties.meta_description satisfies string | undefined
	allProp.properties.ref.properties.ref.properties.meta_description satisfies string | undefined
	allProp.properties.ref.properties.ref.properties.ref.properties satisfies EmptyObjectType
	allProp.properties.test[0].properties.test?.[0].properties satisfies EmptyObjectType
}

// all -> all
type AllAll = ExpandNestedProperty<ContentPage, {
	$all: '$all'
}>;

const allAll: AllAll = {} as AllAll;

// test.properties.ref = undefined
// test.properties.[0].properties.ref[0].properties.ref[0].properties.meta_title;

if (allAll.properties.ref?.properties.ref?.properties.ref?.properties.meta_title) {
	allAll.properties.meta_description satisfies string | undefined
	allAll.properties.ref.properties.meta_description satisfies string | undefined
	allAll.properties.ref.properties.ref.properties.meta_description satisfies string | undefined
	allAll.properties.ref.properties.ref.properties.ref.properties satisfies EmptyObjectType
}
 */

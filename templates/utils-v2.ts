import { BaseExpandable, ReferencedExpandable } from './base-types';
import { FormPickerType } from './form';

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

type OverwriteDocument<T extends BaseExpandable, U> = Overwrite<T, {
	properties: Overwrite<T['properties'], U>
}>;

type ExpandableDocumentKeys<T extends BaseExpandable> = NonNullable<{
	// TODO: Handle BlockList, BlockGrid
	[K in keyof T['properties']]: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>
		? K
		: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>[]
			? K
			: NonNullable<T['properties'][K]> extends FormPickerType
				? K
				: never;
}[keyof T['properties']]>;

type AllFields = '$all';

type ExpandableNestedDocumentKeys<T extends BaseExpandable> = {
	'$all'?:  AllFields
	| {
		[K in keyof T['properties']]?: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>
			// This handles BaseExpandable
			? ExpandableDocumentKeys<NonNullable<T['properties'][K]>['_hidden']>
			: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>[]
				// This handles BaseExpandable[]
				? ExpandableDocumentKeys<NonNullable<T['properties'][K]>[number]['_hidden']>
				: never;
		// TODO Handle BlockList, BlockGrid & Form.
	}[keyof T['properties']]
	| {
		[K in keyof T['properties']]?: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>
			// This handles BaseExpandable
			? ExpandableNestedDocumentKeys<NonNullable<T['properties'][K]>['_hidden']>
			: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>[]
				// This handles BaseExpandable[]
				? ExpandableNestedDocumentKeys<NonNullable<T['properties'][K]>[number]['_hidden']>
				: never;
		// TODO Handle BlockList, BlockGrid & Form.
	}[keyof T['properties']]
} & {
	[K in (ExpandableDocumentKeys<T>)]?: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>
		// This handles BaseExpandable
		? AllFields | ExpandableDocumentKeys<NonNullable<T['properties'][K]>['_hidden']> | ExpandableNestedDocumentKeys<NonNullable<T['properties'][K]>['_hidden']>
		: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>[]
			// This handles BaseExpandable[]
			? AllFields | ExpandableDocumentKeys<NonNullable<T['properties'][K]>[number]['_hidden']> | ExpandableNestedDocumentKeys<NonNullable<T['properties'][K]>[number]['_hidden']>
			: never;
	// TODO Handle BlockList, BlockGrid & Form.
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

type ExpandDoc<T extends BaseExpandable, K extends ExpandableDocumentKeys<T> | undefined> = T extends unknown
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
	? T extends BaseExpandable
		? T extends ReferencedExpandable<BaseExpandable>
			? ForwardOptionalByBase<T, ExpandDoc<T['_hidden'], K>>
			: ForwardOptionalByBase<T, ExpandDoc<T, K>>
		: T extends BaseExpandable[]
			? T extends ReferencedExpandable<BaseExpandable>[]
				? ForwardOptionalByBase<T, ExpandDoc<T[number]['_hidden'], K>[]>
				: ForwardOptionalByBase<T, ExpandDoc<T[number], K>[]>
			: '1 No expansion found'
	: '2 No expansion found'

type ExpandableNestedPropertyKeys<T> = T extends unknown
	? T extends BaseExpandable
		? T extends ReferencedExpandable<BaseExpandable>// ExpandableTopLevelDocumentKeys<T>
			? ExpandableDocumentKeys<T['_hidden']>
			: ExpandableDocumentKeys<T>
		: T extends BaseExpandable[]
			? T extends ReferencedExpandable<BaseExpandable>[]
				? ExpandableDocumentKeys<T[number]['_hidden']>
				: ExpandableDocumentKeys<T[number]>
			: never
	: never;

type ExpandPropertyByKey<T extends BaseExpandable, K extends keyof T['properties']> = T extends unknown
	? NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>
		? ExpandReferencedDocument<NonNullable<T['properties'][K]>>
		: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>[]
			? ExpandReferencedDocument<NonNullable<T['properties'][K]>[number]>[]
			: NonNullable<T['properties'][K]>
	: never;

type ExpandReferencedDocument<T extends ReferencedExpandable<BaseExpandable>> = T extends unknown
	? T extends ReferencedExpandable<BaseExpandable>
		? ExpandOrCleanDocumentByKey<T['_hidden'], undefined>
		: never
	: never;

type CleanPropertyByKey<T extends BaseExpandable, K extends keyof T['properties']> = T extends unknown
	? NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>
		? CleanReferencedDocument<NonNullable<T['properties'][K]>>
		: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>[]
			? CleanReferencedDocument<NonNullable<T['properties'][K]>[number]>[]
			: NonNullable<T['properties'][K]> extends FormPickerType
				? Overwrite<FormPickerType, { form: null }>
				: T['properties'][K]
	: never;

type CleanReferencedDocument<T extends ReferencedExpandable<BaseExpandable>> = T extends ReferencedExpandable<BaseExpandable>
	? Omit<T, '_hidden'>
	: never;

type ExpandOrCleanDocumentByKey<T extends BaseExpandable, K extends ExpandableDocumentKeys<T> | undefined> = OverwriteDocument<T, {
	[P in keyof T['properties']]: P extends ExpandableDocumentKeys<T>
		? P extends K
			? ExpandPropertyByKey<T, P>
			: CleanPropertyByKey<T, P>
		: T['properties'][P]
}>

type ExpandNestedPropertyByKey<T, K extends ExpandableNestedPropertyKeys<T>> = T extends unknown
	? T extends BaseExpandable
		? K extends keyof T['properties']
			? NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>
				// TODO: Clean nested properties
				? ExpandOrCleanDocumentByKey<NonNullable<T['properties'][K]>['_hidden'], ExpandableDocumentKeys<NonNullable<T['properties'][K]>['_hidden']>>
				: NonNullable<T['properties'][K]> extends ReferencedExpandable<BaseExpandable>[]
					? ExpandOrCleanDocumentByKey<NonNullable<T['properties'][K]>[number]['_hidden'], ExpandableDocumentKeys<NonNullable<T['properties'][K]>[number]['_hidden']>>[]
					: 'aa'
			: 'b'
		: T extends BaseExpandable[]
			? K extends keyof T[number]['properties']
				? NonNullable<T[number]['properties'][K]> extends ReferencedExpandable<BaseExpandable>
					? '3' //ExpandField<NonNullable<T[number]['properties'][K]>>
					: '5'
				: '6'
			: '7'
	: never;

export type ExpandNestedProperty<T extends BaseExpandable, K extends ExpandableNestedDocumentKeys<T>> = T extends unknown
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
							: CleanPropertyByKey<T, P>
						: T['properties'][P]
				}>
				: never
			: OverwriteDocument<T, {
				[P in keyof T['properties']]: P extends ExpandableDocumentKeys<T>
					? K[P] extends ExpandableNestedNestedKeys<T['properties'][P]>
						? ExpandNestedNested<NonNullable<T['properties'][P]>, K[P]>
						: CleanPropertyByKey<T, P>
					: T['properties'][P]
			}>
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
				: K[AllFields] extends ExpandableNestedPropertyKeys<NonNullable<T['properties'][NonNullable<ExpandableNestedPropertyKeys<T>>]>>
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
							: CleanPropertyByKey<T, P>
						: T['properties'][P]
				}>
				: never
	: never;

type ExpandableNestedNestedKeys<T> = T extends unknown
	? T extends BaseExpandable
		? T extends ReferencedExpandable<BaseExpandable>// ExpandableTopLevelDocumentPKeys<T>
			? ExpandableNestedDocumentKeys<T['_hidden']>
			: ExpandableNestedDocumentKeys<T>
		: T extends BaseExpandable[]
			? T extends ReferencedExpandable<BaseExpandable>[]
				? ExpandableNestedDocumentKeys<T[number]['_hidden']>
				: ExpandableNestedDocumentKeys<T[number]>
			: never
	: never;

type ExpandNestedNested<T, Y extends ExpandableNestedNestedKeys<T>> = T extends unknown
	? T extends BaseExpandable
		? T extends ReferencedExpandable<BaseExpandable>// ExpandableTopLevelDocumentKeys<T>
			? ExpandNestedProperty<T['_hidden'], Y>
			: ExpandNestedProperty<T, Y>
		: T extends BaseExpandable[]
			? T extends ReferencedExpandable<BaseExpandable>[]
				? ExpandNestedProperty<T[number]['_hidden'], Y>[]
				: ExpandNestedProperty<T[number], Y>[]
			: never
	: never;

type ExpandNestedDocByKey<
	T extends BaseExpandable,
	K extends ExpandableNestedPropertyKeys<T>,
	N extends ExpandableNestedPropertyKeys<NonNullable<T['properties'][K]>>,
	Base extends ExpandOrCleanDocumentByKey<T, K> = ExpandOrCleanDocumentByKey<T, K>
> = OverwriteDocument<Base, {
	[E in keyof Base['properties']]: E extends K
		? ExpandField<NonNullable<T['properties'][E]>, N>
		: Base['properties'][E];
}>

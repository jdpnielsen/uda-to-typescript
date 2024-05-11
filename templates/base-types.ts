export type ObjectType = Record<string | number | symbol, unknown>;
export type EmptyObjectType = Record<string | number | symbol, never>;

type ExtractProps<T extends Record<string, unknown>, Key extends string> = {
	[K in keyof T as K extends Key
		? Key
		: never
	]: T[K];
};

export interface BaseExpandable<
	Properties extends object = ObjectType,
> {
	properties: Properties;
}

export type ReferencedExpandable<T extends BaseExpandable> = BaseExpandable<EmptyObjectType> & { _hidden: T } & Omit<T, 'properties'>;

export type BaseMediaType<
	Alias extends string = string,
	Properties extends ObjectType = ObjectType,
> = BaseExpandable<Properties> & {
	mediaType: Alias;
}

export type Crop<Alias extends string = string, Width extends number = number, Height extends number = number> = {
	alias: Alias;
	width: Width;
	height: Height;
	coordinates: {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	} | null;
}

export type MediaPickerItem<T extends BaseMediaType = BaseMediaType, C extends Crop[] = []> = BaseMediaType<
	T['mediaType'],
	Omit<T['properties'], 'umbracoFile' | 'umbracoExtension' | 'umbracoBytes' | 'umbracoWidth' | 'umbracoHeight'>
> & {
	id: string;
	name: string;
	url: ExtractProps<T['properties'], 'umbracoFile'> extends { umbracoFile: unknown } ? string : null;
	extension: ExtractProps<T['properties'], 'umbracoExtension'> extends { umbracoExtension: unknown }
		? ExtractProps<T['properties'], 'umbracoExtension'>['umbracoExtension']
		: string;
	width: ExtractProps<T['properties'], 'umbracoWidth'> extends { umbracoWidth: unknown } ? number : null;
	height: ExtractProps<T['properties'], 'umbracoHeight'> extends { umbracoHeight: unknown } ? number : null;
	bytes: ExtractProps<T['properties'], 'umbracoBytes'> extends { umbracoBytes: unknown } ? number : null;
	focalPoint: ExtractProps<T['properties'], 'umbracoFile'> extends { umbracoFile: { focalPoint: unknown } }
		? ExtractProps<T['properties'], 'umbracoFile'>['umbracoFile']['focalPoint']
		: null;
	crops: ExtractProps<T['properties'], 'umbracoFile'> extends { umbracoFile: { crops: Crop[] } }
		? (
			// Test that local crops are provided
			C extends Crop[]
				? [...ExtractProps<T['properties'], 'umbracoFile'>['umbracoFile']['crops'], ...C]
				: ExtractProps<T['properties'], 'umbracoFile'>['umbracoFile']['crops']
		)
		: C;
}

export type BaseElementType<
	Alias extends string = string,
	Properties extends object = ObjectType,
> = BaseExpandable<Properties> & {
	id: string;
	contentType: Alias;
}

export interface ContentRoute {
	path: string;
	startItem: {
		id: string;
		path: string;
	};
}

export type BaseDocumentType<
	Alias extends string = string,
	Properties extends ObjectType = ObjectType,
	Cultures extends { [culture: string]: ContentRoute; } = EmptyObjectType
> = BaseElementType<Alias, Properties> & {
	name: string;
	createDate: string;
	updateDate: string;
	route: ContentRoute;
	cultures: Cultures;
}

export interface BaseBlockType<Content extends BaseElementType = BaseElementType, Setting extends BaseElementType | null = BaseElementType | null> {
	content: Content;
	settings: Setting;
}

export interface BaseBlockListType<Block extends BaseBlockType = BaseBlockType> {
	items: Block[];
}

export interface BaseBlockGridType<Block extends BaseGridBlockType<BaseElementType, BaseElementType | null, BaseGridBlockAreaType[]> = BaseGridBlockType> {
	gridColumns: number;
	items: Block[];
}

export interface BaseGridBlockType<
	Content extends BaseElementType = BaseElementType,
	Setting extends BaseElementType | null = BaseElementType | null,
	Areas extends BaseGridBlockAreaType[] = never[]
> extends BaseBlockType<Content, Setting> {
	rowSpan: number;
	columnSpan: number;
	areaGridColumns: number,
	areas: Areas;
}

export interface BaseGridBlockAreaType<Alias extends string = string, Block extends BaseGridBlockType<BaseElementType, BaseElementType | null, never[]> = BaseGridBlockType<BaseElementType, BaseElementType | null, never[]>> {
	alias: Alias;
	rowSpan: number;
	columnSpan: number;
	items: Block[];
}

export type ObjectType = Record<string | number | symbol, unknown>;
export type EmptyObjectType = Record<string | number | symbol, never>;

type ExtractProps<T extends Record<string, unknown>, Key extends string> = {
	[K in keyof T as K extends Key
		? Key
		: never
	]: T[K];
};

export interface ContentRoute {
	path: string;
	startItem: {
		id: string;
		path: string;
	};
}

export interface BaseMediaType<
	Alias extends string = string,
	Properties extends ObjectType = ObjectType,
> {
	mediaType: Alias;
	properties: Properties;
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

export interface BaseDocumentType<
	Alias extends string = string,
	Properties extends ObjectType = ObjectType,
	Cultures extends { [culture: string]: ContentRoute; } = EmptyObjectType
> {
	id: string;
	name: string;
	createDate: string;
	updateDate: string;
	route: ContentRoute;
	contentType: Alias;
	cultures: Cultures;
	properties: Properties;
}

export interface BaseBlockType<Content extends BaseDocumentType = BaseDocumentType, Setting extends BaseDocumentType | null = BaseDocumentType | null> {
	content: Content;
	settings: Setting;
}

export interface BaseBlockListType<Block extends BaseBlockType = BaseBlockType> {
	items: Block[];
}

export interface BaseBlockGridType<Block extends BaseGridBlockType<BaseDocumentType, BaseDocumentType | null, BaseGridBlockAreaType[]> = BaseGridBlockType> {
	gridColumns: number;
	items: Block[];
}

export interface BaseGridBlockType<
	Content extends BaseDocumentType = BaseDocumentType,
	Setting extends BaseDocumentType | null = BaseDocumentType | null,
	Areas extends BaseGridBlockAreaType[] = never[]
> extends BaseBlockType<Content, Setting> {
	rowSpan: number;
	columnSpan: number;
	areaGridColumns: number,
	areas: Areas;
}

export interface BaseGridBlockAreaType<Alias extends string = string, Block extends BaseGridBlockType<BaseDocumentType, BaseDocumentType | null, never[]> = BaseGridBlockType<BaseDocumentType, BaseDocumentType | null, never[]>> {
	alias: Alias;
	rowSpan: number;
	columnSpan: number;
	items: Block[];
}

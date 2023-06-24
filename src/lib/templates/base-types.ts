export type ObjectType = Record<string | number | symbol, unknown>;
export type EmptyObjectType = Record<string | number | symbol, never>;

export interface ContentRoute {
	path: string;
	startItem: {
		id: string;
		path: string;
	};
}

export interface BaseDocumentType<
	Alias extends string = string,
	Properties extends ObjectType = ObjectType,
	Cultures extends { [culture: string]: ContentRoute; } = EmptyObjectType
> {
	id: string;
	name: string;
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

export interface BaseBlockGridType<Block extends BaseGridBlockType<BaseDocumentType, BaseGridBlockAreaType[]> = BaseGridBlockType> {
	gridColumns: number;
	items: Block[];
}

export interface BaseGridBlockType<Content extends BaseDocumentType = BaseDocumentType, Areas extends BaseGridBlockAreaType[] = never[]> extends BaseBlockType<Content> {
	rowSpan: number;
	columnSpan: number;
	areaGridColumns: number,
	areas: Areas;
}

export interface BaseGridBlockAreaType<Alias extends string = string, Block extends BaseGridBlockType<BaseDocumentType, never[]> = BaseGridBlockType<BaseDocumentType, never[]>> {
	alias: Alias;
	rowSpan: number;
	columnSpan: number;
	items: Block[];
}

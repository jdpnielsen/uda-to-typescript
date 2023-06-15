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
	Properties extends ObjectType = EmptyObjectType,
	Cultures extends { [culture: string]: ContentRoute; } = EmptyObjectType
> {
	id: string;
	name: string;
	contentType: Alias;
	cultures: Cultures;
	properties: Properties;
}

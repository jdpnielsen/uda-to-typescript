import { Dependency } from './shared';
import { UDI } from './utils';

export interface DataType {
	Name: string;
	Alias: string;
	EditorAlias: string;
	DatabaseType: number;
	Configuration: Configuration;
	Parent?: UDI;
	Udi: UDI;
	Dependencies: Dependency[];
	__type: string;
	__version: string;
}

interface Configuration {
	[key: string]: unknown;
}

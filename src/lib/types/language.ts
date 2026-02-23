import type { Dependency } from './shared';
import type { UDI } from './utils';

export interface Language {
	Name: string;
	Alias: string;
	IsoCode: string;
	IsDefault: boolean;
	IsMandatory?: boolean;
	Udi: UDI;
	Dependencies: Dependency[];
	__type: string;
	__version: string;
}

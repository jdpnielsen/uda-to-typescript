import type { Dependency } from './shared';
import type { UDI } from './utils';

export interface Template {
	Name: string;
	Alias: string;
	File: string;
	Udi: UDI;
	Dependencies: Dependency[];
	__type: string;
	__version: string;
}

import type { Dependency } from './shared';
import type { GUID, UDI } from './utils';

export interface DataTypeContainer {
	Name: string;
	ContainedObjectType: GUID;
	Udi: UDI;
	Dependencies: Dependency[];
	__type: string;
	__version: string;
}

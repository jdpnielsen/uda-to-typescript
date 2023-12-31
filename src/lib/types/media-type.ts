import { PropertyGroup, PropertyType, Dependency, Permissions } from './shared';
import { UDI } from './utils';

export interface MediaType {
	Name: string;
	Alias: string;
	Icon: string;
	Thumbnail: string;
	Description?: string;
	IsContainer: boolean;
	Permissions: Permissions;
	Parent?: UDI;
	CompositionContentTypes: UDI[];
	PropertyGroups: PropertyGroup[];
	PropertyTypes: PropertyType[];
	Udi: UDI;
	Dependencies: Dependency[];
	__type: string;
	__version: string;
}

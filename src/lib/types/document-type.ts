import type { Dependency, HistoryCleanup, Permissions, PropertyGroup, PropertyType } from './shared';
import type { UDI } from './utils';

export interface DocumentType {
	Name: string;
	Alias: string;
	DefaultTemplate?: string;
	AllowedTemplates: string[];
	HistoryCleanup?: HistoryCleanup;
	Icon: string;
	Thumbnail: string;
	Description?: string;
	IsContainer?: boolean;
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

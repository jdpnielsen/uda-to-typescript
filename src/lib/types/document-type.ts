import { HistoryCleanup, PropertyGroup, PropertyType, Permissions, Dependency } from './shared';
import { UDI } from './utils';

export interface DocumentType {
	Name: string;
	Alias: string;
	DefaultTemplate: string;
	AllowedTemplates: string[];
	HistoryCleanup: HistoryCleanup;
	Icon: string;
	Thumbnail: string;
	Description?: string;
	IsContainer: boolean;
	Permissions: Permissions;
	Parent: UDI;
	CompositionContentTypes: string[];
	PropertyGroups: PropertyGroup[];
	PropertyTypes: PropertyType[];
	Udi: UDI;
	Dependencies: Dependency[];
	__type: string;
	__version: string;
}

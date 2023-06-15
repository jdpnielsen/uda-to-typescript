import { UDI } from './utils';

export interface Dependency {
	Udi: UDI;
	Ordering: boolean;
	Mode: number;
}

export interface PropertyGroup {
	Key: string;
	Name: string;
	SortOrder: number;
	Type: number;
	Alias: string;
	PropertyTypes: PropertyType[];
}

export interface PropertyType {
	Key: string;
	Alias: string;
	DataType: UDI;
	Description?: string;
	Mandatory: boolean;
	MandatoryMessage?: string;
	Name: string;
	SortOrder: number;
	Validation?: string;
	ValidationMessage?: string;
	VariesByCulture: boolean;
	VariesBySegment: boolean;
	LabelOnTop: boolean;
	MemberCanEdit: boolean;
	ViewOnProfile: boolean;
	IsSensitive: boolean;
}

export interface Permissions {
	AllowVaryingByCulture: boolean;
	AllowVaryingBySegment: boolean;
	AllowedAtRoot: boolean;
	IsElementType: boolean;
	AllowedChildContentTypes: UDI[];
}

export interface HistoryCleanup {
	preventCleanup: boolean;
	keepAllVersionsNewerThanDays?: boolean;
	keepLatestVersionPerDayForDays?: boolean;
}

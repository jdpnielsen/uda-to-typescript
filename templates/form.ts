export interface StartItem {
	id: string;
	path: string;
}

export interface ContentRoute {
	path: string;
	/** @nullable */
	queryString?: string | null;
	startItem: StartItem;
}

export const FormFieldIndication = {
	NoIndicator: 'NoIndicator',
	MarkMandatoryFields: 'MarkMandatoryFields',
	MarkOptionalFields: 'MarkOptionalFields',
} as const;
export type FormFieldIndication = typeof FormFieldIndication[keyof typeof FormFieldIndication];

export const FieldConditionActionType = {
	Show: 'Show',
	Hide: 'Hide',
} as const;
export type FieldConditionActionType = typeof FieldConditionActionType[keyof typeof FieldConditionActionType];

export const FieldConditionLogicType = {
	All: 'All',
	Any: 'Any',
} as const;
export type FieldConditionLogicType = typeof FieldConditionLogicType[keyof typeof FieldConditionLogicType];

export const FieldConditionRuleOperator = {
	Is: 'Is',
	IsNot: 'IsNot',
	GreaterThen: 'GreaterThen',
	LessThen: 'LessThen',
	Contains: 'Contains',
	ContainsIgnoreCase: 'ContainsIgnoreCase',
	StartsWith: 'StartsWith',
	StartsWithIgnoreCase: 'StartsWithIgnoreCase',
	EndsWith: 'EndsWith',
	EndsWithIgnoreCase: 'EndsWithIgnoreCase',
	NotContains: 'NotContains',
	NotContainsIgnoreCase: 'NotContainsIgnoreCase',
	NotStartsWith: 'NotStartsWith',
	NotStartsWithIgnoreCase: 'NotStartsWithIgnoreCase',
	NotEndsWith: 'NotEndsWith',
	NotEndsWithIgnoreCase: 'NotEndsWithIgnoreCase',
} as const;
export type FieldConditionRuleOperator = typeof FieldConditionRuleOperator[keyof typeof FieldConditionRuleOperator];

export interface FormConditionRuleDto {
	field: string;
	operator: FieldConditionRuleOperator;
	value: string;
}

export interface FormConditionDto {
	actionType: FieldConditionActionType;
	logicType: FieldConditionLogicType;
	rules: FormConditionRuleDto[];
}

export interface FormFileUploadOptionsDto {
	allowAllUploadExtensions: boolean;
	allowedUploadExtensions: string[];
	allowMultipleFileUploads: boolean;
}

export interface FormFieldPrevalueDto {
	value: string;
	/** @nullable */
	caption?: string | null;
}

export interface FormFieldTypeDto {
	id: string;
	name: string;
	supportsPreValues: boolean;
	supportsUploadTypes: boolean;
	renderInputType: string;
}

export interface FormFieldDtoSettings { [key: string]: string }

export interface FormFieldDto {
	id: string;
	caption: string;
	/** @nullable */
	helpText?: string | null;
	/** @nullable */
	cssClass?: string | null;
	alias: string;
	required: boolean;
	/** @nullable */
	requiredErrorMessage?: string | null;
	/** @nullable */
	pattern?: string | null;
	/** @nullable */
	patternInvalidErrorMessage?: string | null;
	condition?: FormConditionDto;
	fileUploadOptions?: FormFileUploadOptionsDto;
	preValues: FormFieldPrevalueDto[];
	settings: FormFieldDtoSettings;
	type: FormFieldTypeDto;
}

export interface FormFieldsetColumnDto {
	/** @nullable */
	caption?: string | null;
	width: number;
	fields: FormFieldDto[];
}

export interface FormFieldsetDto {
	id: string;
	/** @nullable */
	caption?: string | null;
	condition?: FormConditionDto;
	columns: FormFieldsetColumnDto[];
}

export interface FormPageDto {
	/** @nullable */
	caption?: string | null;
	condition?: FormConditionDto;
	fieldsets: FormFieldsetDto[];
}

export interface FormValidationRuleDto {
	rule: string;
	errorMessage: string;
	fieldId: string;
}

export interface UmbracoForm {
	id: string;
	name: string;
	indicator: string;
	/** @nullable */
	cssClass?: string | null;
	/** @nullable */
	nextLabel?: string | null;
	/** @nullable */
	previousLabel?: string | null;
	/** @nullable */
	submitLabel?: string | null;
	disableDefaultStylesheet: boolean;
	fieldIndicationType: FormFieldIndication;
	hideFieldValidation: boolean;
	/** @nullable */
	messageOnSubmit?: string | null;
	messageOnSubmitIsHtml: boolean;
	showValidationSummary: boolean;
	/** @nullable */
	gotoPageOnSubmit?: string | null;
	gotoPageOnSubmitRoute?: ContentRoute | null;
	pages: FormPageDto[];
	validationRules: FormValidationRuleDto[];
}

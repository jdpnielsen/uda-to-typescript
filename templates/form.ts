export interface FormPickerType {
	id: string;
	form: FormDto;
}

export interface FormDto {
	cssClass?: string | null;
	disableDefaultStylesheet?: boolean;
	fieldIndicationType?: FormFieldIndication;
	gotoPageOnSubmit?: string | null;
	gotoPageOnSubmitRoute?: IApiContentRouteModel;
	hideFieldValidation?: boolean;
	id?: string;
	indicator?: string;
	messageOnSubmit?: string | null;
	messageOnSubmitIsHtml?: boolean;
	name?: string;
	nextLabel?: string | null;
	pages?: FormPageDto[];
	previousLabel?: string | null;
	showValidationSummary?: boolean;
	submitLabel?: string | null;
}

interface IApiContentStartItemModel {
	readonly id?: string;
	readonly path?: string;
}

interface IApiContentRouteModel {
	readonly path?: string;
	startItem?: IApiContentStartItemModel;
}

interface FormFileUploadOptionsDto {
	allowAllUploadExtensions?: boolean;
	allowedUploadExtensions?: string[];
	allowMultipleFileUploads?: boolean;
}

interface FormFieldsetColumnDto {
	caption?: string | null;
	fields?: FormFieldDto[];
	width?: number;
}

interface FormFieldsetDto {
	caption?: string | null;
	columns?: FormFieldsetColumnDto[];
	condition?: FormConditionDto;
	id?: string;
}

interface FormPageDto {
	caption?: string | null;
	condition?: FormConditionDto;
	fieldsets?: FormFieldsetDto[];
}

interface FormFieldTypeDto {
	id?: string;
	name?: string;
	renderInputType?: string;
	supportsPreValues?: boolean;
	supportsUploadTypes?: boolean;
}

interface FormFieldPrevalueDto {
	caption?: string | null;
	value?: string;
}

type FormFieldIndication = typeof FormFieldIndication[keyof typeof FormFieldIndication];

const FormFieldIndication = {
	NoIndicator: 'NoIndicator',
	MarkMandatoryFields: 'MarkMandatoryFields',
	MarkOptionalFields: 'MarkOptionalFields',
} as const;

type FormFieldDtoSettings = { [key: string]: string };

interface FormFieldDto {
	alias?: string;
	caption?: string;
	condition?: FormConditionDto;
	cssClass?: string | null;
	fileUploadOptions?: FormFileUploadOptionsDto;
	helpText?: string | null;
	id?: string;
	pattern?: string | null;
	patternInvalidErrorMessage?: string | null;
	placeholder?: string | null;
	preValues?: FormFieldPrevalueDto[];
	required?: boolean;
	requiredErrorMessage?: string | null;
	settings?: FormFieldDtoSettings;
	type?: FormFieldTypeDto;
}

interface FormConditionRuleDto {
	field?: string;
	operator?: FieldConditionRuleOperator;
	value?: string;
}

interface FormConditionDto {
	actionType?: FieldConditionActionType;
	logicType?: FieldConditionLogicType;
	rules?: FormConditionRuleDto[];
}

type FieldConditionRuleOperator = typeof FieldConditionRuleOperator[keyof typeof FieldConditionRuleOperator];

const FieldConditionRuleOperator = {
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

type FieldConditionLogicType = typeof FieldConditionLogicType[keyof typeof FieldConditionLogicType];

const FieldConditionLogicType = {
	All: 'All',
	Any: 'Any',
} as const;

type FieldConditionActionType = typeof FieldConditionActionType[keyof typeof FieldConditionActionType];

const FieldConditionActionType = {
	Show: 'Show',
	Hide: 'Hide',
} as const;

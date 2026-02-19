import ts from 'typescript';

import { ArtifactContainer } from '../helpers/collect-artifacts';
import { DataType } from '../types/data-type';
import { blockGridHandler } from './Umbraco.BlockGrid';
import { blockListHandler } from './Umbraco.BlockList';
import { checkboxListHandler } from './Umbraco.CheckBoxList';
import { colorPickerHandler } from './Umbraco.ColorPicker';
import { contentPickerHandler } from './Umbraco.ContentPicker';
import { dateOnlyHandler } from './Umbraco.DateOnly';
import { dateTimeHandler } from './Umbraco.DateTime';
import { dateTimeUnspecifiedHandler } from './Umbraco.DateTimeUnspecified';
import { dateTimeWithTimeZoneHandler } from './Umbraco.DateTimeWithTimeZone';
import { decimalHandler } from './Umbraco.Decimal';
import { dropdownHandler } from './Umbraco.DropDown.Flexible';
import { emailAddressHandler } from './Umbraco.EmailAddress';
import { eyedropperHandler } from './Umbraco.ColorPicker.EyeDropper';
import { folderPickerHandler } from './UmbracoForms.FolderPicker';
import { formDetailsPickerHandler } from './UmbracoForms.FormDetailsPicker';
import { formsFormPickerHandler } from './UmbracoForms.FormPicker';
import { imageCropperHandler } from './Umbraco.ImageCropper';
import { integerHandler } from './Umbraco.Integer';
import { labelHandler } from './Umbraco.Label';
import { listViewHandler } from './Umbraco.ListView';
import { markdownEditorHandler } from './Umbraco.MarkdownEditor';
import { mediaPickerHandler } from './Umbraco.MediaPicker3';
import { memberPickerHandler } from './Umbraco.MemberPicker';
import { multiNodePickerHandler } from './Umbraco.MultiNodeTreePicker';
import { multipleTextHandler } from './Umbraco.MultipleTextstring';
import { multiurlPickerHandler } from './Umbraco.MultiUrlPicker';
import { plainDateTimeHandler } from './Umbraco.Plain.DateTime';
import { plainDecimalHandler } from './Umbraco.Plain.Decimal';
import { plainIntegerHandler } from './Umbraco.Plain.Integer';
import { plainJsonHandler } from './Umbraco.Plain.Json';
import { plainStringHandler } from './Umbraco.Plain.String';
import { plainTimeHandler } from './Umbraco.Plain.Time';
import { radioButtonListHandler } from './Umbraco.RadioButtonList';
import { richTextHandler } from './Umbraco.RichText';
import { singleBlockHandler } from './Umbraco.SingleBlock';
import { sliderHandler } from './Umbraco.Slider';
import { tagsHandler } from './Umbraco.Tags';
import { textareaHandler } from './Umbraco.TextArea';
import { textboxHandler } from './Umbraco.TextBox';
import { themePickerHandler } from './UmbracoForms.ThemePicker';
import { timeOnlyHandler } from './Umbraco.TimeOnly';
import { tinyMCEHandler } from './Umbraco.TinyMCE';
import { trueFalseHandler } from './Umbraco.TrueFalse';
import { uploadFieldHandler } from './Umbraco.UploadField';

/**
 * Contract implemented by each datatype handler.
 *
 * - `init` runs once per resolved handler key and can emit shared declarations.
 * - `build` runs for every matching datatype artifact.
 * - `reference` returns the type used when a property references the datatype.
 */
export type HandlerConfig = {
	editorAlias: string;
	init?: (artifacts: ArtifactContainer) => string | ts.Node[];
	build: (dataType: DataType, artifacts: ArtifactContainer) => string | ts.Node[];
	reference: (dataType: DataType, artifacts: ArtifactContainer) => string | ts.TypeNode;
}

/**
 * Registry of datatype handlers keyed by editor alias.
 *
 * Custom handlers can also be keyed by `EditorUiAlias`.
 */
export type DataTypeConfig = {
	[EditorAlias: string]: HandlerConfig
};

export type ResolvedHandlerConfig = {
	key: string;
	handler: HandlerConfig;
}

/**
 * Resolves a datatype handler in migration-safe order.
 *
 * Resolution order:
 * 1. `EditorUiAlias` (split editor model)
 * 2. `EditorAlias` (legacy and fallback)
 */
export function resolveDataTypeHandler(dataTypeHandlers: DataTypeConfig, dataType: DataType): ResolvedHandlerConfig | undefined {
	if (dataType.EditorUiAlias && dataTypeHandlers[dataType.EditorUiAlias]) {
		return {
			key: dataType.EditorUiAlias,
			handler: dataTypeHandlers[dataType.EditorUiAlias],
		};
	}

	if (dataTypeHandlers[dataType.EditorAlias]) {
		return {
			key: dataType.EditorAlias,
			handler: dataTypeHandlers[dataType.EditorAlias],
		};
	}

	return undefined;
}

/**
 * Built-in datatype handlers shipped with the package.
 */
export const dataTypeMap = {
	[blockGridHandler.editorAlias]: blockGridHandler,
	[blockListHandler.editorAlias]: blockListHandler,
	[checkboxListHandler.editorAlias]: checkboxListHandler,
	[colorPickerHandler.editorAlias]: colorPickerHandler,
	[contentPickerHandler.editorAlias]: contentPickerHandler,
	[dateOnlyHandler.editorAlias]: dateOnlyHandler,
	[dateTimeHandler.editorAlias]: dateTimeHandler,
	[dateTimeUnspecifiedHandler.editorAlias]: dateTimeUnspecifiedHandler,
	[dateTimeWithTimeZoneHandler.editorAlias]: dateTimeWithTimeZoneHandler,
	[decimalHandler.editorAlias]: decimalHandler,
	[dropdownHandler.editorAlias]: dropdownHandler,
	[emailAddressHandler.editorAlias]: emailAddressHandler,
	[eyedropperHandler.editorAlias]: eyedropperHandler,
	[folderPickerHandler.editorAlias]: folderPickerHandler,
	[formDetailsPickerHandler.editorAlias]: formDetailsPickerHandler,
	[formsFormPickerHandler.editorAlias]: formsFormPickerHandler,
	[imageCropperHandler.editorAlias]: imageCropperHandler,
	[integerHandler.editorAlias]: integerHandler,
	[labelHandler.editorAlias]: labelHandler,
	[listViewHandler.editorAlias]: listViewHandler,
	[markdownEditorHandler.editorAlias]: markdownEditorHandler,
	[mediaPickerHandler.editorAlias]: mediaPickerHandler,
	[memberPickerHandler.editorAlias]: memberPickerHandler,
	[multiNodePickerHandler.editorAlias]: multiNodePickerHandler,
	[multipleTextHandler.editorAlias]: multipleTextHandler,
	[multiurlPickerHandler.editorAlias]: multiurlPickerHandler,
	[plainDateTimeHandler.editorAlias]: plainDateTimeHandler,
	[plainDecimalHandler.editorAlias]: plainDecimalHandler,
	[plainIntegerHandler.editorAlias]: plainIntegerHandler,
	[plainJsonHandler.editorAlias]: plainJsonHandler,
	[plainStringHandler.editorAlias]: plainStringHandler,
	[plainTimeHandler.editorAlias]: plainTimeHandler,
	[radioButtonListHandler.editorAlias]: radioButtonListHandler,
	[richTextHandler.editorAlias]: richTextHandler,
	[singleBlockHandler.editorAlias]: singleBlockHandler,
	[sliderHandler.editorAlias]: sliderHandler,
	[tagsHandler.editorAlias]: tagsHandler,
	[textareaHandler.editorAlias]: textareaHandler,
	[textboxHandler.editorAlias]: textboxHandler,
	[themePickerHandler.editorAlias]: themePickerHandler,
	[timeOnlyHandler.editorAlias]: timeOnlyHandler,
	[tinyMCEHandler.editorAlias]: tinyMCEHandler,
	[trueFalseHandler.editorAlias]: trueFalseHandler,
	[uploadFieldHandler.editorAlias]: uploadFieldHandler,
} satisfies DataTypeConfig;

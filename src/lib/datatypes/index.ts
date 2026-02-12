import ts from 'typescript';

import { ArtifactContainer } from '../helpers/collect-artifacts';
import { DataType } from '../types/data-type';
import { blockGridHandler } from './Umbraco.BlockGrid';
import { blockListHandler } from './Umbraco.BlockList';
import { checkboxListHandler } from './Umbraco.CheckBoxList';
import { colorPickerHandler } from './Umbraco.ColorPicker';
import { contentPickerHandler } from './Umbraco.ContentPicker';
import { dateTimeHandler } from './Umbraco.DateTime';
import { decimalHandler } from './Umbraco.Decimal';
import { dropdownHandler } from './Umbraco.DropDown.Flexible';
import { emailAddressHandler } from './Umbraco.EmailAddress';
import { eyedropperHandler } from './Umbraco.ColorPicker.EyeDropper';
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
import { sliderHandler } from './Umbraco.Slider';
import { tagsHandler } from './Umbraco.Tags';
import { textareaHandler } from './Umbraco.TextArea';
import { textboxHandler } from './Umbraco.TextBox';
import { tinyMCEHandler } from './Umbraco.TinyMCE';
import { trueFalseHandler } from './Umbraco.TrueFalse';
import { uploadFieldHandler } from './Umbraco.UploadField';
import { formsFormPickerHandler } from './UmbracoForms.FormPicker';

export type HandlerConfig = {
	editorAlias: string;
	init?: (artifacts: ArtifactContainer) => string | ts.Node[];
	build: (dataType: DataType, artifacts: ArtifactContainer) => string | ts.Node[];
	reference: (dataType: DataType, artifacts: ArtifactContainer) => string | ts.TypeNode;
}

export type DataTypeConfig = {
	[EditorAlias: string]: HandlerConfig
};

export type ResolvedHandlerConfig = {
	key: string;
	handler: HandlerConfig;
}

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

export const dataTypeMap = {
	[blockGridHandler.editorAlias]: blockGridHandler,
	[blockListHandler.editorAlias]: blockListHandler,
	[checkboxListHandler.editorAlias]: checkboxListHandler,
	[colorPickerHandler.editorAlias]: colorPickerHandler,
	[contentPickerHandler.editorAlias]: contentPickerHandler,
	[dateTimeHandler.editorAlias]: dateTimeHandler,
	[decimalHandler.editorAlias]: decimalHandler,
	[dropdownHandler.editorAlias]: dropdownHandler,
	[emailAddressHandler.editorAlias]: emailAddressHandler,
	[eyedropperHandler.editorAlias]: eyedropperHandler,
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
	[sliderHandler.editorAlias]: sliderHandler,
	[tagsHandler.editorAlias]: tagsHandler,
	[textareaHandler.editorAlias]: textareaHandler,
	[textboxHandler.editorAlias]: textboxHandler,
	[tinyMCEHandler.editorAlias]: tinyMCEHandler,
	[trueFalseHandler.editorAlias]: trueFalseHandler,
	[uploadFieldHandler.editorAlias]: uploadFieldHandler,
	[formsFormPickerHandler.editorAlias]: formsFormPickerHandler,
} satisfies DataTypeConfig;

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
import { integerHandler } from './Umbraco.Integer';
import { labelHandler } from './Umbraco.Label';
import { markdownEditorHandler } from './Umbraco.MarkdownEditor';
import { multiNodePickerHandler } from './Umbraco.MultiNodeTreePicker';
import { multipleTextHandler } from './Umbraco.MultipleTextstring';
import { multiurlPickerHandler } from './Umbraco.MultiUrlPicker';
import { radioButtonListHandler } from './Umbraco.RadioButtonList';
import { sliderHandler } from './Umbraco.Slider';
import { tagsHandler } from './Umbraco.Tags';
import { textareaHandler } from './Umbraco.TextArea';
import { textboxHandler } from './Umbraco.TextBox';
import { tinyMCEHandler } from './Umbraco.TinyMCE';
import { trueFalseHandler } from './Umbraco.TrueFalse';

export type HandlerConfig = {
	editorAlias: string;
	init?: (artifacts: ArtifactContainer) => ts.Node[];
	build: (dataType: DataType, artifacts: ArtifactContainer) => ts.Node[];
	reference: (dataType: DataType, artifacts: ArtifactContainer) => ts.TypeNode;
}

export const dataTypeMap: {
	[EditorAlias: string]: HandlerConfig
} = {
	// TODO: Umbraco.UploadField
	// TODO: Umbraco.MediaPicker3
	// TODO: Umbraco.ImageCropper
	// TODO: Umbraco.MarkdownEditor
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
	[integerHandler.editorAlias]: integerHandler,
	[labelHandler.editorAlias]: labelHandler,
	[markdownEditorHandler.editorAlias]: markdownEditorHandler,
	[multiNodePickerHandler.editorAlias]: multiNodePickerHandler,
	[multipleTextHandler.editorAlias]: multipleTextHandler,
	[multiurlPickerHandler.editorAlias]: multiurlPickerHandler,
	[radioButtonListHandler.editorAlias]: radioButtonListHandler,
	[sliderHandler.editorAlias]: sliderHandler,
	[tagsHandler.editorAlias]: tagsHandler,
	[textareaHandler.editorAlias]: textareaHandler,
	[textboxHandler.editorAlias]: textboxHandler,
	[tinyMCEHandler.editorAlias]: tinyMCEHandler,
	[trueFalseHandler.editorAlias]: trueFalseHandler,
};

import ts from 'typescript';

import { ArtifactContainer } from '../helpers/collect-artifacts';
import { DataType } from '../types/data-type';
import { dropdownHandler } from './Umbraco.DropDown.Flexible';
import { integerHandler } from './Umbraco.Integer';
import { textboxHandler } from './Umbraco.TextBox';
import { textareaHandler } from './Umbraco.TextArea';
import { tinyMCEHandler } from './Umbraco.TinyMCE';
import { blockListHandler } from './Umbraco.BlockList';
import { dateTimeHandler } from './Umbraco.DateTime';
import { colorPickerHandler } from './Umbraco.ColorPicker';
import { eyedropperHandler } from './Umbraco.ColorPicker.EyeDropper';
import { decimalHandler } from './Umbraco.Decimal';
import { emailAddressHandler } from './Umbraco.EmailAddress';
import { labelHandler } from './Umbraco.Label';
import { trueFalseHandler } from './Umbraco.TrueFalse';
import { sliderHandler } from './Umbraco.Slider';
import { tagsHandler } from './Umbraco.Tags';
import { radioButtonListHandler } from './Umbraco.RadioButtonList';
import { checkboxListHandler } from './Umbraco.CheckBoxList';
import { multiurlPickerHandler } from './Umbraco.MultiUrlPicker';
import { contentPickerHandler } from './Umbraco.ContentPicker';
import { blockGridHandler } from './Umbraco.BlockGrid';
import { multiNodePickerHandler } from './Umbraco.MultiNodeTreePicker';

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
	// TODO: Umbraco.MultipleTextstring
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
	[multiurlPickerHandler.editorAlias]: multiurlPickerHandler,
	[multiNodePickerHandler.editorAlias]: multiNodePickerHandler,
	[radioButtonListHandler.editorAlias]: radioButtonListHandler,
	[sliderHandler.editorAlias]: sliderHandler,
	[tagsHandler.editorAlias]: tagsHandler,
	[textareaHandler.editorAlias]: textareaHandler,
	[textboxHandler.editorAlias]: textboxHandler,
	[tinyMCEHandler.editorAlias]: tinyMCEHandler,
	[trueFalseHandler.editorAlias]: trueFalseHandler,
};

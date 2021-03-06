import { IButton } from "../../button/template-interface";
import { ICheckbox } from "../../checkbox/template-interface";
import { IColorPicker } from "../../color-picker/template-interface";
import { IFileControlDownload, IFileControlUpload } from "../../file-control/template-interface";
import { IPicker } from "../../picker/template-interface";
import { IRange } from "../../range/template-interface";
import { ISelect } from "../../select/template-interface";
import { ITabs } from "../../tabs/template-interface";
interface IControlBase {
    id: string;
    title?: string;
}
declare type ControlButtonKey = "button";
interface IControlButton extends IControlBase, IButton {
    type: ControlButtonKey;
}
declare type ControlCheckboxKey = "checkbox";
interface IControlCheckbox extends IControlBase, ICheckbox {
    type: ControlCheckboxKey;
}
declare type ControlFileUploadKey = "file-upload";
interface IControlFileUpload extends IControlBase {
    type: ControlFileUploadKey;
    accept?: IFileControlUpload["accept"];
    id: IFileControlUpload["id"];
    defaultMessage: IFileControlUpload["defaultMessage"];
}
declare type ControlFileDownloadKey = "file-download";
interface IControlFileDownload extends IControlBase {
    type: ControlFileDownloadKey;
    id: IFileControlDownload["id"];
    label: IFileControlDownload["label"];
}
declare type ControlPickerKey = "picker";
interface IControlPicker extends IControlBase, IPicker {
    type: ControlPickerKey;
}
declare type ControlRangeKey = "range";
interface IControlRange extends IControlBase, IRange {
    type: ControlRangeKey;
}
declare type ControlSelectKey = "select";
interface IControlSelect extends IControlBase, ISelect {
    type: ControlSelectKey;
}
declare type ControlTabsKey = "tabs";
interface IControlTabs extends IControlBase, ITabs {
    type: ControlTabsKey;
}
declare type ControlColorPickerKey = "color-picker";
interface IControlColorPicker extends IControlBase, IColorPicker {
    type: ControlColorPickerKey;
}
declare type ISupportedControl = IControlTabs | IControlCheckbox | IControlRange | IControlButton | IControlFileUpload | IControlFileDownload | IControlPicker | IControlColorPicker | IControlSelect;
interface IControlSection {
    title: string;
    id?: string;
    controls: ISupportedControl[];
}
export interface IControlsBlock {
    controlsSections: IControlSection[];
}
export declare const supportedControls: {
    Button: ControlButtonKey;
    Checkbox: ControlCheckboxKey;
    FileUpload: ControlFileUploadKey;
    FileDownload: ControlFileDownloadKey;
    Picker: ControlPickerKey;
    Range: ControlRangeKey;
    Select: ControlSelectKey;
    Tabs: ControlTabsKey;
    ColorPicker: ControlColorPickerKey;
};
export {};

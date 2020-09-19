import { IButton } from "../../button/IButton";
import { ICheckbox } from "../../checkbox/ICheckbox";
import { IFileControlDownload, IFileControlUpload } from "../../file-control/IFileControl";
import { IPicker } from "../../picker/IPicker";
import { IRange } from "../../range/IRange";
import { ITabs } from "../../tabs/ITabs";
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
declare type ControlTabsKey = "tabs";
interface IControlTabs extends IControlBase, ITabs {
    type: ControlTabsKey;
}
declare type ISupportedControl = IControlTabs | IControlCheckbox | IControlRange | IControlButton | IControlFileUpload | IControlFileDownload | IControlPicker;
interface IControlSection {
    title: string;
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
    Tabs: ControlTabsKey;
};
export {};

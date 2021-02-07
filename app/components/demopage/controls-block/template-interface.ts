import { IButton } from "../../button/template-interface";
import { ICheckbox } from "../../checkbox/template-interface";
import { IColorPicker } from "../../color-picker/template-interface";
import { IFileControlDownload, IFileControlUpload } from "../../file-control/template-interface";
import { IPicker } from "../../picker/template-interface";
import { IRange } from "../../range/template-interface";
import { ITabs } from "../../tabs/template-interface";

interface IControlBase {
    id: string;
    title?: string;
}

type ControlButtonKey = "button";
interface IControlButton extends IControlBase, IButton {
    type: ControlButtonKey;
}

type ControlCheckboxKey = "checkbox";
interface IControlCheckbox extends IControlBase, ICheckbox {
    type: ControlCheckboxKey;
}

type ControlFileUploadKey = "file-upload";
interface IControlFileUpload extends IControlBase {
    type: ControlFileUploadKey;

    accept?: IFileControlUpload["accept"];
    id: IFileControlUpload["id"];
    defaultMessage: IFileControlUpload["defaultMessage"];
}

type ControlFileDownloadKey = "file-download";
interface IControlFileDownload extends IControlBase {
    type: ControlFileDownloadKey;

    id: IFileControlDownload["id"];
    label: IFileControlDownload["label"];
}

type ControlPickerKey = "picker";
interface IControlPicker extends IControlBase, IPicker {
    type: ControlPickerKey;
}

type ControlRangeKey = "range";
interface IControlRange extends IControlBase, IRange {
    type: ControlRangeKey;
}

type ControlTabsKey = "tabs";
interface IControlTabs extends IControlBase, ITabs {
    type: ControlTabsKey;
}

type ControlColorPickerKey = "color-picker";
interface IControlColorPicker extends IControlBase, IColorPicker {
    type: ControlColorPickerKey;
}

type ISupportedControl = IControlTabs | IControlCheckbox | IControlRange | IControlButton |
IControlFileUpload | IControlFileDownload | IControlPicker | IControlColorPicker;

interface IControlSection {
    title: string;
    id?: string;
    controls: ISupportedControl[];
}

export interface IControlsBlock {
    controlsSections: IControlSection[];
}

export const supportedControls: {
    Button: ControlButtonKey,
    Checkbox: ControlCheckboxKey,
    FileUpload: ControlFileUploadKey,
    FileDownload: ControlFileDownloadKey,
    Picker: ControlPickerKey,
    Range: ControlRangeKey,
    Tabs: ControlTabsKey,
    ColorPicker: ControlColorPickerKey,
} = {
    Button: "button",
    Checkbox: "checkbox",
    FileUpload: "file-upload",
    FileDownload: "file-download",
    Picker: "picker",
    Range: "range",
    Tabs: "tabs",
    ColorPicker: "color-picker"
}

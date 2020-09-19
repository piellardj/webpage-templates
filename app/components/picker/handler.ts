// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Picker {
    type PickerObserver = (selectedValue: string | null) => unknown;

    interface IPickerObject {
        wrapper: HTMLElement;
        leftButton: HTMLElement;
        rightButton: HTMLElement;
        span: HTMLSpanElement;
        inputs: NodeListOf<HTMLInputElement>;
        observers: PickerObserver[];
    }

    interface IPickersDictionary {
        [id: string]: IPickerObject;
    }

    /**
     * Populates pickers dictionary and binds events.
     */
    function buildPickersDictionary(): IPickersDictionary {
        const dictionary: IPickersDictionary = {};

        const pickers = document.querySelectorAll(".inline-picker");
        for (let i = 0; i < pickers.length; ++i) {
            const picker: IPickerObject = {
                wrapper: pickers[i] as HTMLElement,
                leftButton: pickers[i].querySelector(".picker-button.left"),
                rightButton: pickers[i].querySelector(".picker-button.right"),
                span: pickers[i].querySelector("span"),
                inputs: pickers[i].querySelectorAll("input"),
                observers: [],
            };

            bindPickerEvents(picker);
            dictionary[pickers[i].id] = picker;
        }

        return dictionary;
    }

    const pickersDictionary = buildPickersDictionary();
    const DISABLED_BUTTON_CLASS = "disabled";

    function getIndexOfCheckedInput(picker: IPickerObject): number {
        for (let i = 0; i < picker.inputs.length; ++i) {
            if (picker.inputs[i].checked) {
                return i;
            }
        }
        return -1;
    }

    function enableButton(button: HTMLElement, enable: boolean): void {
        if (enable) {
            button.classList.remove(DISABLED_BUTTON_CLASS);
        } else if (!button.classList.contains(DISABLED_BUTTON_CLASS)) {
            button.classList.add(DISABLED_BUTTON_CLASS);
        }
    }

    /**
     *  Updates selector text and disables/enables buttons if needed.
     */
    function updateVisibleValue(picker: IPickerObject, callObservers: boolean): void {
        const index = getIndexOfCheckedInput(picker);
        let selectedLabel: string;
        let selectedValue: string | null = null;
        if (index >= 0) {
            selectedLabel = picker.inputs[index].dataset.label;
            selectedValue = picker.inputs[index].value;
        } else {
            selectedLabel = picker.wrapper.dataset.placeholder || "";
        }

        picker.span.innerText = selectedLabel;

        if (picker.inputs.length < 0) {
            enableButton(picker.leftButton, false);
            enableButton(picker.rightButton, false);
        } else {
            enableButton(picker.leftButton, !picker.inputs[0].checked);
            enableButton(picker.rightButton,
                !picker.inputs[picker.inputs.length - 1].checked);
        }

        if (callObservers) {
            for (const observer of picker.observers) {
                observer(selectedValue);
            }
        }
    }

    function isButtonEnabled(button: HTMLElement): boolean {
        return !button.classList.contains(DISABLED_BUTTON_CLASS);
    }

    function bindPickerEvents(picker: IPickerObject): void {
        picker.leftButton.addEventListener("click", function () {
            if (isButtonEnabled(picker.leftButton)) {
                const index = getIndexOfCheckedInput(picker);
                if (index < 0) {
                    picker.inputs[picker.inputs.length - 1].checked = true;
                } else if (index > 0) {
                    picker.inputs[index].checked = false;
                    picker.inputs[index - 1].checked = true;
                }

                updateVisibleValue(picker, true);
            }
        });

        picker.rightButton.addEventListener("click", function () {
            if (isButtonEnabled(picker.rightButton)) {
                const index = getIndexOfCheckedInput(picker);
                if (index < 0) {
                    picker.inputs[0].checked = true;
                } else if (index < picker.inputs.length - 1) {
                    picker.inputs[index].checked = false;
                    picker.inputs[index + 1].checked = true;
                }

                updateVisibleValue(picker, true);
            }
        });

        updateVisibleValue(picker, true);
    }

    export function addObserver(id: string, observer: PickerObserver): void {
        pickersDictionary[id].observers.push(observer);
    }

    export function getValue(id: string): string | null {
        const picker = pickersDictionary[id];
        const index = getIndexOfCheckedInput(picker);
        if (index >= 0) {
            return picker.inputs[index].value;
        }
        return null;
    }

    export function setValue(id: string, value: string): void {
        const picker = pickersDictionary[id];
        for (let i = 0; i < picker.inputs.length; ++i) {
            picker.inputs[i].checked = (picker.inputs[i].value === value);
        }
        updateVisibleValue(picker, false);
    }
}

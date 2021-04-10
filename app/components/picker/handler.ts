/// <reference path="../helpers.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Picker {
    export type PickerObserver = (selectedValue: string | null) => unknown;

    class Picker {
        public readonly id: string;
        public readonly observers: PickerObserver[] = [];

        private readonly container: HTMLElement;
        private readonly leftButton: HTMLButtonElement;
        private readonly rightButton: HTMLButtonElement;
        private readonly spanElement: HTMLSpanElement;
        private readonly radioInputs: HTMLInputElement[];

        private _value: string;

        public constructor(container: HTMLElement) {
            this.id = container.id;

            this.container = container;
            this.leftButton = container.querySelector(".picker-button.left");
            this.rightButton = container.querySelector(".picker-button.right");
            this.spanElement = container.querySelector("span");

            this.radioInputs = [];
            const radioInputs = container.querySelectorAll("input");
            for (let i = 0; i < radioInputs.length; i++) {
                this.radioInputs.push(radioInputs[i]);
            }

            this.leftButton.addEventListener("click", () => {
                const index = this.getIndexOfCheckedInput();
                this.checkOnlyRadio(index - 1, this.radioInputs.length - 1);
                this.updateValue();
                Storage.storeState(this);
                this.callObservers();
            });

            this.rightButton.addEventListener("click", () => {
                const index = this.getIndexOfCheckedInput();
                this.checkOnlyRadio(index + 1, 0);
                this.updateValue();
                Storage.storeState(this);
                this.callObservers();
            });

            this.updateValue();
        }

        public get value(): string {
            return this._value;
        }

        public set value(newValue: string) {
            for (const radioInput of this.radioInputs) {
                radioInput.checked = (radioInput.value === newValue);
            }

            this.updateValue();
        }

        private getIndexOfCheckedInput(): number {
            for (let i = 0; i < this.radioInputs.length; i++) {
                if (this.radioInputs[i].checked) {
                    return i;
                }
            }
            return -1;
        }

        private updateValue(): void {
            const indexOfSelected = this.getIndexOfCheckedInput();
            if (indexOfSelected >= 0) {
                this._value = this.radioInputs[indexOfSelected].value;
            } else {
                this._value = null;
            }
            this.updateAppearance();
        }

        private updateAppearance(): void {
            const index = this.getIndexOfCheckedInput();
            let selectedLabel: string;
            if (index >= 0) {
                selectedLabel = this.radioInputs[index].dataset.label;
            } else {
                selectedLabel = this.container.dataset.placeholder || "";
            }

            this.spanElement.innerText = selectedLabel;

            if (this.radioInputs.length < 0) {
                this.enableButton(this.leftButton, false);
                this.enableButton(this.rightButton, false);
            } else {
                this.enableButton(this.leftButton, !this.radioInputs[0].checked);
                this.enableButton(this.rightButton, !this.radioInputs[this.radioInputs.length - 1].checked);
            }
        }

        private callObservers(): void {
            for (const observer of this.observers) {
                observer(this.value);
            }
        }

        private enableButton(button: HTMLButtonElement, enable: boolean): void {
            button.disabled = !enable;
        }

        private checkOnlyRadio(index: number, defaultIndex: number): void {
            for (const radioInput of this.radioInputs) {
                radioInput.checked = false;
            }

            if (index >= 0 || index < this.radioInputs.length) {
                this.radioInputs[index].checked = true;
            } else {
                this.radioInputs[defaultIndex].checked = true;
            }
        }
    }

    namespace Cache {
        type PickersCache = { [id: string]: Picker };

        function loadCache(): PickersCache {
            const result: PickersCache = {};
            const containerElements = document.querySelectorAll("div.inline-picker[id]") as NodeListOf<HTMLElement>;
            for (let i = 0; i < containerElements.length; i++) {
                const tabs = new Picker(containerElements[i]);
                result[tabs.id] = tabs;
            }
            return result;
        }

        let pickersCache: PickersCache;

        export function getPickerById(id: string): Picker {
            Cache.load();
            return pickersCache[id] || null;
        }

        export function load(): void {
            if (typeof pickersCache === "undefined") {
                pickersCache = loadCache();
            }
        }
    }

    namespace Storage {
        const PREFIX = "picker";
        const NULL_VALUE = "__null__";

        export function storeState(picker: Picker): void {
            const value = (picker.value === null) ? NULL_VALUE : picker.value;
            Page.Helpers.URL.setQueryParameter(PREFIX, picker.id, value);
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (controlId: string, value: string) => {
                const picker = Cache.getPickerById(controlId);
                if (!picker) {
                    Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                } else {
                    picker.value = value;
                }
            });
        }
    }

    Helpers.Events.callAfterDOMLoaded(() => {
        Cache.load();
        Storage.applyStoredState();
    });

    export function addObserver(id: string, observer: PickerObserver): void {
        const picker = Cache.getPickerById(id);
        picker.observers.push(observer);
    }

    export function getValue(id: string): string | null {
        const picker = Cache.getPickerById(id);
        return picker.value;
    }

    export function setValue(id: string, value: string): void {
        const picker = Cache.getPickerById(id);
        picker.value = value;
    }
}

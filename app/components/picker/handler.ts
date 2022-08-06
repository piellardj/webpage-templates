/// <reference path="../helpers.ts"/>

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
                pickersStorage.storeState(this);
                this.callObservers();
            });

            this.rightButton.addEventListener("click", () => {
                const index = this.getIndexOfCheckedInput();
                this.checkOnlyRadio(index + 1, 0);
                this.updateValue();
                pickersStorage.storeState(this);
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

        public callObservers(): void {
            for (const observer of this.observers) {
                observer(this.value);
            }
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
                selectedLabel = this.radioInputs[index].dataset["label"];
            } else {
                selectedLabel = this.container.dataset["placeholder"] || "";
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

        private enableButton(button: HTMLButtonElement, enable: boolean): void {
            button.disabled = !enable;
        }

        private checkOnlyRadio(index: number, defaultIndex: number): void {
            for (const radioInput of this.radioInputs) {
                radioInput.checked = false;
            }

            if (index >= 0 && index < this.radioInputs.length) {
                this.radioInputs[index].checked = true;
            } else {
                this.radioInputs[defaultIndex].checked = true;
            }
        }
    }

    const pickersCache = new Page.Helpers.Cache<Picker>("Picker", () => {
        const pickersList: Picker[] = [];
        const containerElements = document.querySelectorAll("div.inline-picker[id]") as NodeListOf<HTMLElement>;
        for (let i = 0; i < containerElements.length; i++) {
            const picker = new Picker(containerElements[i]);
            pickersList.push(picker);
        }
        return pickersList;
    });

    const pickersStorage = new Page.Helpers.Storage<Picker>("picker",
        (picker: Picker) => {
            return (picker.value === null) ? "__null__" : picker.value;
        },
        (id: string, serializedValue: string) => {
            const picker = pickersCache.getByIdSafe(id);
            if (picker) {
                picker.value = serializedValue;
                return true;
            }
            return false;
        });

    Helpers.Events.callAfterDOMLoaded(() => {
        pickersCache.load();
        pickersStorage.applyStoredState();
    });

    export function addObserver(id: string, observer: PickerObserver): void {
        const picker = pickersCache.getById(id);
        picker.observers.push(observer);
    }

    export function getValue(id: string): string | null {
        const picker = pickersCache.getById(id);
        return picker.value;
    }

    export function setValue(id: string, value: string): void {
        const picker = pickersCache.getById(id);
        picker.value = value;
    }

    export function storeState(id: string): void {
        const picker = pickersCache.getById(id);
        pickersStorage.storeState(picker);
    }
    export function clearStoredState(id: string): void {
        const picker = pickersCache.getById(id);
        pickersStorage.clearStoredState(picker);
    }
}

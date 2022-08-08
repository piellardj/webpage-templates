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

        private _value: string | null = null;

        public constructor(container: HTMLElement) {
            this.id = container.id;

            this.container = container;
            this.leftButton = Page.Helpers.Utils.selector(container, ".picker-button.left");
            this.rightButton = Page.Helpers.Utils.selector(container, ".picker-button.right");
            this.spanElement = Page.Helpers.Utils.selector(container, "span");

            this.radioInputs = Page.Helpers.Utils.selectorAll(container, "input");

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

        public get value(): string | null {
            return this._value;
        }

        public set value(newValue: string | null) {
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
            return Page.Helpers.Utils.findFirst(this.radioInputs,
                (radio: HTMLInputElement) => radio.checked);
        }

        private updateValue(): void {
            const indexOfSelected = this.getIndexOfCheckedInput();
            const checkedInput = this.radioInputs[indexOfSelected];
            if (checkedInput) {
                this._value = checkedInput.value;
            } else {
                this._value = null;
            }
            this.updateAppearance();
        }

        private updateAppearance(): void {
            const index = this.getIndexOfCheckedInput();
            const checkedInput = this.radioInputs[index];
            let selectedLabel: string;
            if (checkedInput) {
                selectedLabel = checkedInput.dataset["label"] || "<no label>";
            } else {
                selectedLabel = this.container.dataset["placeholder"] || "";
            }

            this.spanElement.innerText = selectedLabel;

            const firstRadio = this.radioInputs[0];
            const lastRadio = this.radioInputs[this.radioInputs.length - 1];
            if (firstRadio && lastRadio) {
                this.enableButton(this.leftButton, !firstRadio.checked);
                this.enableButton(this.rightButton, !lastRadio.checked);
            } else {
                this.enableButton(this.leftButton, false);
                this.enableButton(this.rightButton, false);
            }
        }

        private enableButton(button: HTMLButtonElement, enable: boolean): void {
            button.disabled = !enable;
        }

        private checkOnlyRadio(index: number, defaultIndex: number): void {
            for (const radioInput of this.radioInputs) {
                radioInput.checked = false;
            }

            let inputToCheck: HTMLInputElement | undefined;
            if (index >= 0 && index < this.radioInputs.length) {
                inputToCheck = this.radioInputs[index];
            } else if (defaultIndex >= 0 && defaultIndex < this.radioInputs.length) {
                inputToCheck = this.radioInputs[defaultIndex];
            }

            if (!inputToCheck) {
                throw new Error(`No input to check: index=${index} and defaultIndex=${defaultIndex}.`);
            }
            inputToCheck.checked = true;
        }
    }

    const pickersCache = new Page.Helpers.Cache<Picker>("Picker", () => {
        const containerElements = Page.Helpers.Utils.selectorAll(document, "div.inline-picker[id]");
        return containerElements.map((containerElement: HTMLElement) => {
            return new Picker(containerElement);
        });
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

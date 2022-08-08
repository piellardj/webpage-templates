/// <reference path="../helpers.ts"/>

namespace Page.Checkbox {
    export type CheckboxObserver = (isChecked: boolean) => unknown;

    class Checkbox {
        public readonly id: string;
        private readonly element: HTMLInputElement;
        public readonly observers: CheckboxObserver[] = [];

        private _checked: boolean;

        public constructor(element: HTMLInputElement) {
            this.id = element.id;
            this.element = element;
            this.reloadValue();

            this.element.addEventListener("change", () => {
                this.reloadValue();
                checkboxesStorage.storeState(this);
                this.callObservers();
            });
        }

        public get checked(): boolean {
            return this._checked;
        }

        public set checked(newChecked: boolean) {
            this.element.checked = newChecked;
            this.reloadValue();
        }

        public callObservers(): void {
            for (const observer of this.observers) {
                observer(this.checked);
            }
        }

        private reloadValue(): void {
            this._checked = this.element.checked;
        }
    }

    const checkboxesCache = new Page.Helpers.Cache<Checkbox>("Checkbox", () => {
        const selector = "div.checkbox > input[type=checkbox][id]";
        const elements = Page.Helpers.Utils.selectorAll<HTMLInputElement>(document, selector);
        return elements.map((element: HTMLInputElement) => {
            return new Checkbox(element);
        });
    });

    const checkboxesStorage = new Page.Helpers.Storage<Checkbox>("checkbox",
        (checkbox: Checkbox) => {
            return checkbox.checked ? "true" : "false";
        },
        (id: string, serializedValue: string) => {
            const checkbox = checkboxesCache.getByIdSafe(id);
            if (checkbox && (serializedValue === "true" || serializedValue === "false")) {
                checkbox.checked = (serializedValue === "true");
                checkbox.callObservers();
                return true;
            }
            return false;
        });

    Helpers.Events.callAfterDOMLoaded(() => {
        checkboxesCache.load();
        checkboxesStorage.applyStoredState();
    });

    export function addObserver(checkboxId: string, observer: CheckboxObserver): void {
        const checkbox = checkboxesCache.getById(checkboxId);
        checkbox.observers.push(observer);
    }

    export function setChecked(checkboxId: string, value: boolean): void {
        const checkbox = checkboxesCache.getById(checkboxId);
        checkbox.checked = value;
    }

    export function isChecked(checkboxId: string): boolean {
        const checkbox = checkboxesCache.getById(checkboxId);
        return checkbox.checked;
    }

    export function storeState(checkboxId: string): void {
        const checkbox = checkboxesCache.getById(checkboxId);
        checkboxesStorage.storeState(checkbox);
    }
    export function clearStoredState(checkboxId: string): void {
        const checkbox = checkboxesCache.getById(checkboxId);
        checkboxesStorage.clearStoredState(checkbox);
    }
}

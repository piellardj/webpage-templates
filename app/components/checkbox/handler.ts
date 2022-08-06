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
                Storage.storeState(this);
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
        const checkboxesList: Checkbox[] = [];
        const selector = "div.checkbox > input[type=checkbox][id]";
        const elements = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
        for (let i = 0; i < elements.length; i++) {
            const checkbox = new Checkbox(elements[i]);
            checkboxesList.push(checkbox);
        }
        return checkboxesList;
    });

    namespace Storage {
        const PREFIX = "checkbox";
        const CHECKED = "true";
        const UNCHECKED = "false";

        export function storeState(checkbox: Checkbox): void {
            const stateAsString = checkbox.checked ? CHECKED : UNCHECKED;
            Page.Helpers.URL.setQueryParameter(PREFIX, checkbox.id, stateAsString);
        }

        export function clearStoredState(checkbox: Checkbox): void {
            Page.Helpers.URL.removeQueryParameter(PREFIX, checkbox.id);
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (checkboxId: string, value: string) => {
                const checkbox = checkboxesCache.getByIdSafe(checkboxId);
                if (!checkbox || (value !== CHECKED && value !== UNCHECKED)) {
                    console.log("Removing invalid query parameter '" + checkboxId + "=" + value + "'.");
                    Page.Helpers.URL.removeQueryParameter(PREFIX, checkboxId);
                } else {
                    checkbox.checked = (value === CHECKED);
                    checkbox.callObservers();
                }
            });
        }
    }

    Helpers.Events.callAfterDOMLoaded(() => {
        checkboxesCache.load();
        Storage.applyStoredState();
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
        Storage.storeState(checkbox);
    }
    export function clearStoredState(checkboxId: string): void {
        const checkbox = checkboxesCache.getById(checkboxId);
        Storage.clearStoredState(checkbox);
    }
}

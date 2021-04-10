/// <reference path="../helpers.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Checkbox {
    export type CheckboxObserver = (isChecked: boolean) => unknown;

    class Checkbox {
        public readonly id: string;
        private readonly element: HTMLInputElement;
        public readonly observers: CheckboxObserver[] = []

        private _checked: boolean;

        public constructor(element: HTMLInputElement) {
            this.id = element.id;
            this.element = element;
            this.reloadValue();

            this.element.addEventListener("change", () => {
                this.reloadValue();
                Storage.storeState(this);
                for (const observer of this.observers) {
                    observer(this.checked);
                }
            });
        }

        public get checked(): boolean {
            return this._checked;
        }

        public set checked(newChecked: boolean) {
            this.element.checked = newChecked;
            this.reloadValue();
        }

        private reloadValue(): void {
            this._checked = this.element.checked;
        }
    }

    namespace Cache {
        type CheckboxesCache = { [id: string]: Checkbox };

        function loadCache(): CheckboxesCache {
            const result: CheckboxesCache = {};

            const selector = "div.checkbox > input[type=checkbox][id]";
            const elements = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
            for (let i = 0; i < elements.length; i++) {
                const checkbox = new Checkbox(elements[i]);
                result[checkbox.id] = checkbox;
            }
            return result;
        }

        let checkboxesCache: CheckboxesCache;

        export function getCheckboxById(id: string): Checkbox | null {
            Cache.load();
            return checkboxesCache[id] || null;
        }

        export function load(): void {
            if (typeof checkboxesCache === "undefined") {
                checkboxesCache = loadCache();
            }
        }
    }

    namespace Storage {
        const PREFIX = "checkbox";
        const CHECKED = "true";
        const UNCHECKED = "false";

        export function storeState(checkbox: Checkbox): void {
            const stateAsString = checkbox.checked ? CHECKED : UNCHECKED;
            Page.Helpers.URL.setQueryParameter(PREFIX, checkbox.id, stateAsString);
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (checkboxId: string, value: string) => {
                const checkbox = Cache.getCheckboxById(checkboxId);
                if (!checkbox || (value !== CHECKED && value !== UNCHECKED)) {
                    console.log("Removing invalid query parameter '" + checkboxId + "=" + value + "'.");
                    Page.Helpers.URL.removeQueryParameter(PREFIX, checkboxId);
                } else {
                    checkbox.checked = (value === CHECKED);
                }
            });
        }
    }

    Helpers.Events.callAfterDOMLoaded(() => {
        Cache.load();
        Storage.applyStoredState();
    });

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(checkboxId: string, observer: CheckboxObserver): boolean {
        const checkbox = Cache.getCheckboxById(checkboxId);
        if (checkbox) {
            checkbox.observers.push(observer);
            return true;
        }
        return false;
    }

    export function setChecked(checkboxId: string, value: boolean): void {
        const checkbox = Cache.getCheckboxById(checkboxId);
        if (checkbox) {
            checkbox.checked = value;
        }
    }

    export function isChecked(checkboxId: string): boolean {
        const checkbox = Cache.getCheckboxById(checkboxId);
        if (checkbox) {
            return checkbox.checked;
        }
        return false;
    }
}

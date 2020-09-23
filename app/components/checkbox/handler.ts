/// <reference path="../helpers.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Checkbox {
    function getCheckboxFromId(id: string): HTMLInputElement | null {
        const selector = "input[type=checkbox][id=" + id + "]";
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find checkbox '" + selector + "'.");
        }
        return elt as HTMLInputElement;
    }

    namespace Storage {
        const PREFIX = "checkbox";
        const CHECKED = "true";
        const UNCHECKED = "false";

        export function attachStorageEvents(): void {
            const checkboxesSelector = "div.checkbox > input[type=checkbox][id]";
            const checkboxes = document.querySelectorAll(checkboxesSelector) as NodeListOf<HTMLInputElement>;
            checkboxes.forEach((checkbox: HTMLInputElement) => {
                checkbox.addEventListener("change", () => {
                    const value = checkbox.checked ? CHECKED : UNCHECKED;
                    Page.Helpers.URL.setQueryParameter(PREFIX, checkbox.id, value);
                });
            });
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (checkboxId: string, value: string) => {
                const input = getCheckboxFromId(checkboxId);
                if (!input || (value !== CHECKED && value !== UNCHECKED)) {
                    console.log("Removing invalid query parameter '" + checkboxId + "=" + value + "'.");
                    Page.Helpers.URL.removeQueryParameter(PREFIX, checkboxId);
                } else {
                    input.checked = (value === CHECKED);
                }
            });
        }
    }

    Storage.applyStoredState();
    Storage.attachStorageEvents();

    type CheckboxObserver = (isChecked: boolean) => unknown;

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(checkboxId: string, observer: CheckboxObserver): boolean {
        const elt = getCheckboxFromId(checkboxId);
        if (elt) {
            elt.addEventListener("change", (event: Event) => {
                event.stopPropagation();
                observer(elt.checked);
            }, false);
            return true;
        }

        return false;
    }

    export function setChecked(checkboxId: string, value: boolean): void {
        const elt = getCheckboxFromId(checkboxId);
        if (elt) {
            elt.checked = value ? true : false;
        }
    }

    export function isChecked(checkboxId: string): boolean {
        const elt = getCheckboxFromId(checkboxId);
        return !!elt && elt.checked;
    }
}

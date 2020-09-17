namespace Checkbox {
    function getCheckboxFromId(id: string): HTMLInputElement | null {
        const selector = "input[type=checkbox][id=" + id + "]";
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find checkbox '" + selector + "'.");
        }
        return elt as HTMLInputElement;
    }

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

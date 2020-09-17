declare namespace Checkbox {
    type CheckboxObserver = (isChecked: boolean) => unknown;
    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(checkboxId: string, observer: CheckboxObserver): boolean;
    export function setChecked(checkboxId: string, value: boolean): void;
    export function isChecked(checkboxId: string): boolean;
    export {};
}

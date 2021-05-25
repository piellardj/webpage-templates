/// <reference path="../helpers.d.ts" />
declare namespace Page.Checkbox {
    type CheckboxObserver = (isChecked: boolean) => unknown;
    /**
     * @return {boolean} Whether or not the observer was added
     */
    function addObserver(checkboxId: string, observer: CheckboxObserver): boolean;
    function setChecked(checkboxId: string, value: boolean, updateURLStorage?: boolean): void;
    function isChecked(checkboxId: string): boolean;
}

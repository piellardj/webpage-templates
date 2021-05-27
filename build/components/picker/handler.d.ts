/// <reference path="../helpers.d.ts" />
declare namespace Page.Picker {
    type PickerObserver = (selectedValue: string | null) => unknown;
    function addObserver(id: string, observer: PickerObserver): void;
    function getValue(id: string): string | null;
    function setValue(id: string, value: string): void;
    function storeState(id: string): void;
    function clearStoredState(id: string): void;
}

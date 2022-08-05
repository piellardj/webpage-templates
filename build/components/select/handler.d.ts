/// <reference path="../helpers.d.ts" />
declare namespace Page.Select {
    type SelectObserver = (selectedValue: string | null) => unknown;
    function addObserver(id: string, observer: SelectObserver): void;
    function getValue(id: string): string | null;
    function setValue(id: string, value: string | null): void;
    function storeState(id: string): void;
    function clearStoredState(id: string): void;
}

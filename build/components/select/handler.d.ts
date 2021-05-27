/// <reference path="../helpers.d.ts" />
declare namespace Page.Select {
    type SelectObserver = (selectedValue: string | null) => unknown;
    function addObserver(id: string, observer: SelectObserver): void;
    function getValue(id: string): string | null;
    function setValue(id: string, value: string, updateURLStorage?: boolean): void;
}

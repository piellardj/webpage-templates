/// <reference path="../helpers.d.ts" />
declare namespace Page.Tabs {
    type TabsObserver = (selectedValues: string[]) => unknown;
    function addObserver(tabsId: string, observer: TabsObserver): void;
    function getValues(tabsId: string): string[];
    function setValues(tabsId: string, values: string[], updateURLStorage?: boolean): void;
    function storeState(tabsId: string): void;
    function clearStoredState(tabsIdd: string): void;
}

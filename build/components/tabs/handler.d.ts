/// <reference path="../helpers.d.ts" />
declare namespace Page.Tabs {
    type TabsObserver = (selectedValues: string[]) => unknown;
    /**
     * @return {boolean} Whether or not the observer was added
     */
    function addObserver(tabsId: string, observer: TabsObserver): boolean;
    function getValues(tabsId: string): string[];
    function setValues(tabsId: string, values: string[], updateURLStorage?: boolean): void;
}

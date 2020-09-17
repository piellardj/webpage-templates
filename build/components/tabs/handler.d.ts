declare namespace Tabs {
    type TabsObserver = (selectedValues: string[]) => unknown;
    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(tabsId: string, observer: TabsObserver): boolean;
    export function getValues(tabsId: string): string[];
    export function setValues(tabsId: string, values: string[]): void;
    export {};
}

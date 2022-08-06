/// <reference path="../helpers.ts"/>

namespace Page.Tabs {
    export type TabsObserver = (selectedValues: string[]) => unknown;

    class Tabs {
        private static readonly ID_SUFFIX = "-id";

        public static computeShortId(fullId: string): string {
            if (fullId.lastIndexOf(Tabs.ID_SUFFIX) != fullId.length - Tabs.ID_SUFFIX.length) {
                throw new Error("Invalid tabs container id: '" + fullId + "'.");
            }
            return fullId.substring(0, fullId.length - Tabs.ID_SUFFIX.length);
        }

        public readonly id: string;

        private readonly inputElements: HTMLInputElement[];
        public readonly observers: TabsObserver[] = [];

        private _values: string[];

        public constructor(container: HTMLElement) {
            this.id = Tabs.computeShortId(container.id);
            this.inputElements = [];

            const inputElements = container.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
            for (let i = 0; i < inputElements.length; i++) {
                this.inputElements.push(inputElements[i]);
                inputElements[i].addEventListener("change", (event) => {
                    event.stopPropagation();
                    this.reloadValues();
                    Storage.storeState(this);
                    this.callObservers();
                }, false);
            }
            this.reloadValues();
        }

        public get values(): string[] {
            return this._values;
        }

        public set values(newValues: string[]) {
            for (const inputElement of this.inputElements) {
                let isWanted = false;
                for (const newValue of newValues) {
                    if (inputElement.value === newValue) {
                        isWanted = true;
                        break;
                    }
                }
                inputElement.checked = isWanted;
            }

            this.reloadValues();
        }

        public callObservers(): void {
            for (const observer of this.observers) {
                observer(this._values);
            }
        }

        private reloadValues(): void {
            const values: string[] = [];
            for (const inputElement of this.inputElements) {
                if (inputElement.checked) {
                    values.push(inputElement.value);
                }
            }
            this._values = values;
        }
    }

    const tabsCache = new Page.Helpers.Cache<Tabs>("Tabs", () => {
        const tabsList: Tabs[] = [];
        const containerElements = document.querySelectorAll("div.tabs[id]") as NodeListOf<HTMLElement>;
        for (let i = 0; i < containerElements.length; i++) {
            const tabs = new Tabs(containerElements[i]);
            tabsList.push(tabs);
        }
        return tabsList;
    });

    namespace Storage {
        const PREFIX = "tabs";
        const SEPARATOR = ";";

        export function storeState(tabs: Tabs): void {
            const valuesList = tabs.values;
            const values = valuesList.join(SEPARATOR);
            Page.Helpers.URL.setQueryParameter(PREFIX, tabs.id, values);
        }

        export function clearStoredState(tabs: Tabs): void {
            Page.Helpers.URL.removeQueryParameter(PREFIX, tabs.id);
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (controlId: string, value: string) => {
                const values = value.split(SEPARATOR);
                const tabs = tabsCache.getByIdSafe(controlId);
                if (!tabs) {
                    console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                    Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                } else {
                    tabs.values = values;
                    tabs.callObservers();
                }
            });
        }
    }

    Helpers.Events.callAfterDOMLoaded(() => {
        tabsCache.load();
        Storage.applyStoredState();
    });

    export function addObserver(tabsId: string, observer: TabsObserver): void {
        const tabs = tabsCache.getById(tabsId);
        tabs.observers.push(observer);
    }

    export function getValues(tabsId: string): string[] {
        const tabs = tabsCache.getById(tabsId);
        return tabs.values;
    }

    export function setValues(tabsId: string, values: string[], updateURLStorage: boolean = false): void {
        const tabs = tabsCache.getById(tabsId);
        tabs.values = values;

        if (updateURLStorage) {
            Storage.storeState(tabs);
        }
    }

    export function storeState(tabsId: string): void {
        const tabs = tabsCache.getById(tabsId);
        Storage.storeState(tabs);
    }
    export function clearStoredState(tabsIdd: string): void {
        const tabs = tabsCache.getById(tabsIdd);
        Storage.clearStoredState(tabs);
    }
}

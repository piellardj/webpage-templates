/// <reference path="../helpers.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    namespace Cache {
        type TabsCache = { [id: string]: Tabs };

        function loadCache(): TabsCache {
            const result: TabsCache = {};
            const containerElements = document.querySelectorAll("div.tabs[id]") as NodeListOf<HTMLElement>;
            for (let i = 0; i < containerElements.length; i++) {
                const tabs = new Tabs(containerElements[i]);
                result[tabs.id] = tabs;
            }
            return result;
        }

        let tabsCache: TabsCache;

        export function getTabsById(id: string): Tabs {
            Cache.load();
            return tabsCache[id] || null;
        }

        export function load(): void {
            if (typeof tabsCache === "undefined") {
                tabsCache = loadCache();
            }
        }
    }

    namespace Storage {
        const PREFIX = "tabs";
        const SEPARATOR = ";";

        export function storeState(tabs: Tabs): void {
            const valuesList = tabs.values;
            const values = valuesList.join(SEPARATOR);
            Page.Helpers.URL.setQueryParameter(PREFIX, tabs.id, values);
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (controlId: string, value: string) => {
                const values = value.split(SEPARATOR);
                const tabs = Cache.getTabsById(controlId);
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
        Cache.load();
        Storage.applyStoredState();
    });

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(tabsId: string, observer: TabsObserver): boolean {
        const tabs = Cache.getTabsById(tabsId);
        if (tabs) {
            tabs.observers.push(observer);
            return true;
        }
        return false;
    }

    export function getValues(tabsId: string): string[] {
        const tabs = Cache.getTabsById(tabsId);
        return tabs.values;
    }

    export function setValues(tabsId: string, values: string[], updateURLStorage: boolean = false): void {
        const tabs = Cache.getTabsById(tabsId);
        tabs.values = values;

        if (updateURLStorage) {
            Storage.storeState(tabs);
        }
    }
}

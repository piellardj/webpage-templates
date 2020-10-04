/// <reference path="../helpers.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Tabs {
    const ID_SUFFIX = "-id";

    function getTabsById(id: string): Element | null {
        const selector = "div.tabs[id=" + id + ID_SUFFIX + "]";
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find tabs '" + selector + "'.");
        }
        return elt;
    }

    /**
     * @param {Object} tabsElt Node tab element
     */
    function getSelectedValues(tabsElt: Element): string[] {
        const values = [];

        const inputs = tabsElt.querySelectorAll("input");
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (input.checked) {
                values.push(input.value);
            }
        }

        return values;
    }

    namespace Storage {
        const PREFIX = "tabs";
        const SEPARATOR = ";";

        export function attachStorageEvents(): void {
            const tabsElements = document.querySelectorAll("div.tabs[id]");
            for (let i = 0; i < tabsElements.length; i++) {
                const tabsElement = tabsElements[i];

                const fullId = tabsElement.id;
                if (fullId.indexOf(ID_SUFFIX, fullId.length - ID_SUFFIX.length) !== -1) {
                    const id = fullId.substring(0, fullId.length - ID_SUFFIX.length);

                    const saveTabsState = (): void => {
                        const valuesList = getSelectedValues(tabsElement);
                        const values = valuesList.join(SEPARATOR);
                        Page.Helpers.URL.setQueryParameter(PREFIX, id, values);
                    };

                    const inputs = tabsElement.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
                    for (let i = 0; i < inputs.length; i++) {
                        inputs[i].addEventListener("change", saveTabsState);
                    }
                }
            }
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (controlId: string, value: string) => {
                const values = value.split(SEPARATOR);
                if (!getTabsById(controlId)) {
                    console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                    Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                } else {
                    setValues(controlId, values);
                }
            });
        }
    }

    Storage.applyStoredState();
    Storage.attachStorageEvents();

    type TabsObserver = (selectedValues: string[]) => unknown;

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(tabsId: string, observer: TabsObserver): boolean {
        const divWrapper = getTabsById(tabsId);
        if (divWrapper) {
            const inputs = divWrapper.querySelectorAll("input");
            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];

                input.addEventListener("change", function (event) {
                    event.stopPropagation();
                    observer(getSelectedValues(divWrapper));
                }, false);
            }
            return true;
        }

        return false;
    }

    export function getValues(tabsId: string): string[] {
        const divWrapper = getTabsById(tabsId);
        if (!divWrapper) {
            return [];
        }

        return getSelectedValues(divWrapper);
    }

    export function setValues(tabsId: string, values: string[]): void {
        const divWrapper = getTabsById(tabsId);
        const inputs = divWrapper.querySelectorAll("input");

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].checked = false;
        }

        for (const value of values) {
            const id = tabsId + "-" + value + "-id";
            const inputElement = divWrapper.querySelector("input[id=" + id + "]") as HTMLInputElement;
            inputElement.checked = true;
        }
    }
}

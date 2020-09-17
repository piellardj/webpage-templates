// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Tabs {
    function getTabsById(id: string): Element | null {
        const selector = "div.tabs[id=" + id + "-id]";
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

    type TabsObserver = (selectedValues: string[]) => unknown;

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(tabsId: string, observer: TabsObserver): boolean {
        const divWrapper = getTabsById(tabsId);
        if (divWrapper) {
            const inputs = divWrapper.querySelectorAll("input");
            Array.prototype.forEach.call(inputs, function (input) {
                input.addEventListener("change", function (event) {
                    event.stopPropagation();
                    observer(getSelectedValues(divWrapper));
                }, false);
            });
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

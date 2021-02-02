/// <reference path="../helpers.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Range {
    function update(range: HTMLInputElement): void {
        const container = range.parentElement;
        const handle = container.querySelector(".range-handle") as HTMLElement;
        const leftBar = container.querySelector(".range-bar-left") as HTMLElement;
        const rightBar = container.querySelector(".range-bar-right") as HTMLElement;
        const tooltip = container.querySelector("output.range-tooltip") as HTMLElement;

        const progression = (+range.value - +range.min) / (+range.max - +range.min);

        const width = container.getBoundingClientRect().width;
        const handleSize = handle.getBoundingClientRect().width;
        const handleCenter = 0.5 * handleSize + progression * (width - handleSize);

        leftBar.style.width = handleCenter + "px";
        rightBar.style.width = (width - handleCenter) + "px";
        handle.style.left = handleCenter + "px";
        tooltip.style.left = handleCenter + "px";
        tooltip.textContent = range.value;
    }

    window.addEventListener("load", function (): void {
        const updateFunctions = [];

        const selector = ".range-container > input[type='range']";
        const rangeElements = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;

        for (let i = 0; i < rangeElements.length; i++) {
            const rangeElement = rangeElements[i];
            const updateFunction = function (): void {
                update(rangeElement);
            };
            updateFunctions.push(updateFunction);

            rangeElement.addEventListener("input", updateFunction);
            rangeElement.addEventListener("change", updateFunction);
            updateFunction();
        }

        const updateEverything = function(): void {
            for (const updateFunction of updateFunctions) {
                updateFunction();
            }
        }
        window.addEventListener("resize", updateEverything);
        setInterval(updateEverything, 1000); // update on a regular basis
    });

    function getRangeById(id: string): HTMLInputElement | null {
        const selector = "input[type=range][id=" + id + "]";
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find range '" + selector + "'.");
        }
        return elt as HTMLInputElement;
    }

    namespace Storage {
        const PREFIX = "range";

        export function attachStorageEvents(): void {
            const inputsSelector = "div.range input.slider[type=range][id]";
            const inputElements = document.querySelectorAll(inputsSelector) as NodeListOf<HTMLInputElement>;
            for (let i = 0; i < inputElements.length; i++) {
                const inputElement = inputElements[i];
                inputElement.addEventListener("change", () => {
                    Page.Helpers.URL.setQueryParameter(PREFIX, inputElement.id, inputElement.value);
                });
            }
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (controlId: string, value: string) => {
                const input = getRangeById(controlId);
                if (!input) {
                    console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                    Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                } else {
                    setValue(controlId, +value);
                }
            });
        }
    }

    Storage.applyStoredState();
    Storage.attachStorageEvents();

    type RangeObserver = (rangeValue: number) => unknown;

    /**
     * @return {boolean} Whether or not the observer was added
     */
    function addObserverInternal(rangeId: string, observer: RangeObserver, eventName: string): boolean {
        const elt = getRangeById(rangeId);
        if (elt) {
            elt.addEventListener(eventName, function (event) {
                event.stopPropagation();
                observer(+elt.value);
            }, false);
            return true;
        }

        return false;
    }

    const isIE11 = !!window.MSInputMethodContext && !!document["documentMode"];

    /**
     * Callback will be called every time the value changes.
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(rangeId: string, observer: RangeObserver): boolean {
        if (isIE11) { // bug in IE 11, input event is never fired
            return addObserverInternal(rangeId, observer, "change");
        } else {
            return addObserverInternal(rangeId, observer, "input");
        }
    }

    /**
     * Callback will be called only when the value stops changing.
     * @return {boolean} Whether or not the observer was added
     */
    export function addLazyObserver(rangeId: string, observer: RangeObserver): boolean {
        return addObserverInternal(rangeId, observer, "change");
    }

    export function getValue(rangeId: string): number | null {
        const elt = getRangeById(rangeId);
        if (!elt) {
            return null;
        }
        return +elt.value;
    }

    export function setValue(rangeId: string, value: number): void {
        const elt = getRangeById(rangeId);
        if (elt) {
            elt.value = "" + value;
            update(elt);
        }
    }
}

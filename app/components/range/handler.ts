/// <reference path="../helpers.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Range {
    function isRangeElement(elt: unknown): boolean {
        return (elt as HTMLInputElement).type && (elt as HTMLInputElement).type.toLowerCase() === "range";
    }

    function getRangeById(id: string): HTMLInputElement | null {
        const selector = "input[type=range][id=" + id + "]";
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find range '" + selector + "'.");
        }
        return elt as HTMLInputElement;
    }

    const thumbSize = 16;

    function updateTooltipPosition(range: HTMLInputElement, tooltip: HTMLElement): void {
        tooltip.textContent = range.value;

        const bodyRect = document.body.getBoundingClientRect();
        const rangeRect = range.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let percentage = 0;
        if (+range.max > +range.min){
            percentage = (+range.value - +range.min) / (+range.max - +range.min);
        }

        const top = (rangeRect.top - tooltipRect.height - bodyRect.top) - 4;
        const middle = percentage * (rangeRect.width - thumbSize) +
            (rangeRect.left + 0.5 * thumbSize) - bodyRect.left;

        tooltip.style.top = top + "px";
        tooltip.style.left = (middle - 0.5 * tooltipRect.width) + "px";
    }

    window.addEventListener("load", function () {
        const tooltips = document.querySelectorAll(".tooltip") as NodeListOf<HTMLElement>;
        for (let i = 0; i < tooltips.length; i++) {
            const tooltip = tooltips[i];

            const range = tooltip.previousElementSibling as HTMLInputElement;
            if (isRangeElement(range)) {
                range.parentNode.addEventListener("mouseenter", function () {
                    updateTooltipPosition(range, tooltip);
                }, false);

                range.addEventListener("input", function () {
                    updateTooltipPosition(range, tooltip);
                }, false);
            }
        }
    });

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
        }
    }
}

/// <reference path="../helpers.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Range {
    export type RangeObserver = (rangeValue: number) => unknown;

    class Range {
        private readonly inputElement: HTMLInputElement;
        private readonly progressLeftElement: HTMLElement;
        private readonly tooltipElement: HTMLElement;

        private _value: number;

        public readonly id: string;
        private readonly nbDecimalsToDisplay: number;

        public readonly onInputObservers: RangeObserver[] = [];
        public readonly onChangeObservers: RangeObserver[] = [];

        public constructor(container: HTMLElement) {
            this.inputElement = container.querySelector("input[type='range']");
            this.progressLeftElement = container.querySelector(".range-progress-left");
            this.tooltipElement = container.querySelector("output.range-tooltip");

            this.id = this.inputElement.id;
            const inputMin = +this.inputElement.min;
            const inputMax = +this.inputElement.max;
            const inputStep = +this.inputElement.step;
            this.nbDecimalsToDisplay = Range.getMaxNbDecimals(inputMin, inputMax, inputStep);

            this.inputElement.addEventListener("input", (event: Event) => {
                event.stopPropagation();
                this.reloadValue();
                this.callSpecificObservers(this.onInputObservers);
            });
            this.inputElement.addEventListener("change", (event: Event) => {
                event.stopPropagation();
                this.reloadValue();
                Storage.storeState(this);
                this.callSpecificObservers(this.onChangeObservers);
            });
            this.reloadValue();

        }

        public get value(): number {
            return this._value;
        }

        public set value(newValue: number) {
            this.inputElement.value = "" + newValue;
            this.reloadValue();
        }

        public callObservers(): void {
            this.callSpecificObservers(this.onInputObservers);
            this.callSpecificObservers(this.onChangeObservers);
        }

        private callSpecificObservers(observers: RangeObserver[]): void {
            for (const observer of observers) {
                observer(this.value);
            }
        }

        private updateAppearance(): void {
            const currentLength = +this.inputElement.value - +this.inputElement.min;
            const totalLength = +this.inputElement.max - +this.inputElement.min;
            let progression = currentLength / totalLength;
            progression = Math.max(0, Math.min(1, progression));
            this.progressLeftElement.style.width = (100 * progression) + "%";

            let text: string;
            if (this.nbDecimalsToDisplay < 0) {
                text = this.inputElement.value;
            } else {
                text = (+this.inputElement.value).toFixed(this.nbDecimalsToDisplay);
            }
            this.tooltipElement.textContent = text;
        }

        private reloadValue(): void {
            this._value = +this.inputElement.value;
            this.updateAppearance();
        }

        private static getMaxNbDecimals(...numbers: number[]): number {
            let nbDecimals = -1;
            for (const n of numbers) {
                const local = Range.nbDecimals(n);
                if (n < 0) {
                    return -1;
                } else if (nbDecimals < local) {
                    nbDecimals = local;
                }
            }
            return nbDecimals;
        }

        private static nbDecimals(x: number): number {
            const xAsString = x.toString();
            if (/^[0-9]+$/.test(xAsString)) {
                return 0;
            } else if (/^[0-9]+\.[0-9]+$/.test(xAsString)) {
                return xAsString.length - (xAsString.indexOf(".") + 1);
            }
            return -1; // failed to parse
        }
    }

    namespace Cache {
        type RangesCache = { [id: string]: Range };

        function loadCache(): RangesCache {
            const result: RangesCache = {};

            const selector = ".range-container > input[type='range']";
            const rangeElements = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
            for (let i = 0; i < rangeElements.length; i++) {
                const container = rangeElements[i].parentElement;
                const id = rangeElements[i].id;
                result[id] = new Range(container);
            }

            return result;
        }

        let rangesCache: RangesCache;

        export function getRangeById(id: string): Range | null {
            Cache.load();
            return rangesCache[id] || null;
        }

        export function load(): void {
            if (typeof rangesCache === "undefined") {
                rangesCache = loadCache();
            }
        }
    }

    namespace Storage {
        const PREFIX = "range";

        export function storeState(range: Range): void {
            const valueAsString = "" + range.value;
            Page.Helpers.URL.setQueryParameter(PREFIX, range.id, valueAsString);
        }

        export function clearStoredState(range: Range): void {
            Page.Helpers.URL.removeQueryParameter(PREFIX, range.id);
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (controlId: string, value: string) => {
                const range = Cache.getRangeById(controlId);
                if (!range) {
                    console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                    Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                } else {
                    range.value = +value;
                    range.callObservers();
                }
            });
        }
    }

    Helpers.Events.callAfterDOMLoaded(() => {
        Cache.load();
        Storage.applyStoredState();
    });

    const isIE11 = !!window.MSInputMethodContext && !!document["documentMode"];

    /**
     * Callback will be called every time the value changes.
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(rangeId: string, observer: RangeObserver): boolean {
        const range = Cache.getRangeById(rangeId);
        if (range) {
            if (isIE11) { // bug in IE 11, input event is never fired
                range.onChangeObservers.push(observer);
            } else {
                range.onInputObservers.push(observer);
            }
            return true;
        }
        return false;
    }

    /**
     * Callback will be called only when the value stops changing.
     * @return {boolean} Whether or not the observer was added
     */
    export function addLazyObserver(rangeId: string, observer: RangeObserver): boolean {
        const range = Cache.getRangeById(rangeId);
        if (range) {
            range.onChangeObservers.push(observer);
            return true;
        }
        return false;
    }

    export function getValue(rangeId: string): number | null {
        const range = Cache.getRangeById(rangeId);
        if (!range) {
            return null;
        }
        return range.value;
    }

    export function setValue(rangeId: string, value: number): void {
        const range = Cache.getRangeById(rangeId);
        if (range) {
            range.value = value;
        }
    }

    export function storeState(rangeId: string): void {
        const range = Cache.getRangeById(rangeId);
        Storage.storeState(range);
    }
    export function clearStoredState(rangeId: string): void {
        const range = Cache.getRangeById(rangeId);
        Storage.clearStoredState(range);
    }
}

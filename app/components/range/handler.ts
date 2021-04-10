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

        public readonly onInputObservers: RangeObserver[] = [];
        public readonly onChangeObservers: RangeObserver[] = [];

        public constructor(container: HTMLElement) {
            this.inputElement = container.querySelector("input[type='range']");
            this.progressLeftElement = container.querySelector(".range-progress-left");
            this.tooltipElement = container.querySelector("output.range-tooltip");

            this.id = this.inputElement.id;

            this.inputElement.addEventListener("input", (event: Event) => {
                event.stopPropagation();
                this.reloadValue();
                for (const observer of this.onInputObservers) {
                    observer(this.value);
                }
            });
            this.inputElement.addEventListener("change", (event: Event) => {
                event.stopPropagation();
                this.reloadValue();
                Storage.storeState(this);
                
            });
            this.reloadValue();
        }

        public get value(): number {
            return this._value;
        }

        public set value(newValue: number) {
            this.inputElement.value = "" + newValue;
            this.reloadValue();
            this.callObservers();
        }

        private callObservers(): void {
            for (const observer of this.onChangeObservers) {
                observer(this.value);
            }
        }

        private updateAppearance(): void {
            const currentLength = +this.inputElement.value - +this.inputElement.min;
            const totalLength = +this.inputElement.max - +this.inputElement.min;
            let progression = currentLength / totalLength;
            progression = Math.max(0, Math.min(1, progression));
            this.progressLeftElement.style.width = (100 * progression) + "%";

            this.tooltipElement.textContent = this.inputElement.value;
        }

        private reloadValue(): void {
            this._value = +this.inputElement.value;
            this.updateAppearance();
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

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (controlId: string, value: string) => {
                const range = Cache.getRangeById(controlId);
                if (!range) {
                    console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                    Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                } else {
                    range.value = +value;
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
}

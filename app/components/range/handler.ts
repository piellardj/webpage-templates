/// <reference path="../helpers.ts"/>

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
            this.inputElement = Page.Helpers.Utils.selector(container, "input[type='range']");
            this.progressLeftElement = Page.Helpers.Utils.selector(container, ".range-progress-left");
            this.tooltipElement = Page.Helpers.Utils.selector(container, "output.range-tooltip");

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
                rangesStorage.storeState(this);
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

    const rangesCache = new Page.Helpers.Cache<Range>("Range", () => {
        const selector = ".range-container > input[type='range']";
        const rangeElements = Page.Helpers.Utils.selectorAll<HTMLInputElement>(document, selector);
        return rangeElements.map((rangeElement: HTMLInputElement) => {
            const container = rangeElement.parentElement!;
            return new Range(container);
        });
    });

    const rangesStorage = new Page.Helpers.Storage<Range>("range",
        (range: Range) => {
            return "" + range.value;
        },
        (id: string, serializedValue: string) => {
            const range = rangesCache.getByIdSafe(id);
            if (range) {
                range.value = +serializedValue;
                range.callObservers();
                return true;
            }
            return false;
        });

    Helpers.Events.callAfterDOMLoaded(() => {
        rangesCache.load();
        rangesStorage.applyStoredState();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isIE11 = !!(window as any).MSInputMethodContext && !!(document as any).documentMode;

    export function addObserver(rangeId: string, observer: RangeObserver): void {
        const range = rangesCache.getById(rangeId);
        if (isIE11) { // bug in IE 11, input event is never fired
            range.onChangeObservers.push(observer);
        } else {
            range.onInputObservers.push(observer);
        }
    }

    /**
     * Callback will be called only when the value stops changing.
     */
    export function addLazyObserver(rangeId: string, observer: RangeObserver): void {
        const range = rangesCache.getById(rangeId);
        range.onChangeObservers.push(observer);
    }

    export function getValue(rangeId: string): number {
        const range = rangesCache.getById(rangeId);
        return range.value;
    }

    export function setValue(rangeId: string, value: number): void {
        const range = rangesCache.getById(rangeId);
        range.value = value;
    }

    export function storeState(rangeId: string): void {
        const range = rangesCache.getById(rangeId);
        rangesStorage.storeState(range);
    }
    export function clearStoredState(rangeId: string): void {
        const range = rangesCache.getById(rangeId);
        rangesStorage.clearStoredState(range);
    }
}

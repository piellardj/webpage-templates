declare namespace Page.Range {
    type RangeObserver = (rangeValue: number) => unknown;
    /**
     * Callback will be called every time the value changes.
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(rangeId: string, observer: RangeObserver): boolean;
    /**
     * Callback will be called only when the value stops changing.
     * @return {boolean} Whether or not the observer was added
     */
    export function addLazyObserver(rangeId: string, observer: RangeObserver): boolean;
    export function getValue(rangeId: string): number | null;
    export function setValue(rangeId: string, value: number): void;
    export {};
}

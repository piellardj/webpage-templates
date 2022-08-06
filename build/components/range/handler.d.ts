/// <reference path="../helpers.d.ts" />
declare namespace Page.Range {
    type RangeObserver = (rangeValue: number) => unknown;
    function addObserver(rangeId: string, observer: RangeObserver): void;
    /**
     * Callback will be called only when the value stops changing.
     */
    function addLazyObserver(rangeId: string, observer: RangeObserver): void;
    function getValue(rangeId: string): number;
    function setValue(rangeId: string, value: number): void;
    function storeState(rangeId: string): void;
    function clearStoredState(rangeId: string): void;
}

declare namespace Page.Picker {
    type PickerObserver = (selectedValue: string | null) => unknown;
    export function addObserver(id: string, observer: PickerObserver): void;
    export function getValue(id: string): string | null;
    export function setValue(id: string, value: string): void;
    export {};
}

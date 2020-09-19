declare namespace Page.Button {
    type ButtonObserver = () => unknown;
    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(buttonId: string, observer: ButtonObserver): boolean;
    export function setLabel(buttonId: string, label: string): void;
    export {};
}

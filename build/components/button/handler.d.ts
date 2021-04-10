declare namespace Page.Button {
    type ButtonObserver = () => unknown;
    /**
     * @return {boolean} Whether or not the observer was added
     */
    function addObserver(buttonId: string, observer: ButtonObserver): boolean;
    function setLabel(buttonId: string, label: string): void;
}

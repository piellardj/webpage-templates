declare namespace Page.Button {
    type ButtonObserver = () => unknown;
    function addObserver(buttonId: string, observer: ButtonObserver): void;
    function setLabel(buttonId: string, label: string): void;
}

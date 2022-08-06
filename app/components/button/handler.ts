namespace Page.Button {
    export type ButtonObserver = () => unknown;

    class Button {
        public readonly id: string;
        public readonly observers: ButtonObserver[] = [];
        private readonly element: HTMLButtonElement;

        public constructor(element: HTMLButtonElement) {
            this.id = element.id;
            this.element = element;

            this.element.addEventListener("click", (event: MouseEvent) => {
                event.stopPropagation();
                for (const observer of this.observers) {
                    observer();
                }
            }, false);
        }

        public set label(newLabel: string) {
            this.element.innerText = newLabel;
        }
    }

    const buttonsCache = new Page.Helpers.Cache<Button>("Button", () => {
        const buttonsList: Button[] = [];
        const elements = document.querySelectorAll("button[id]") as NodeListOf<HTMLButtonElement>;
        for (let i = 0; i < elements.length; i++) {
            const button = new Button(elements[i]);
            buttonsList.push(button);
        }
        return buttonsList;
    });

    export function addObserver(buttonId: string, observer: ButtonObserver): void {
        const button = buttonsCache.getById(buttonId);
        button.observers.push(observer);
    }

    export function setLabel(buttonId: string, label: string): void {
        const button = buttonsCache.getById(buttonId);
        button.label = label;
    }
}

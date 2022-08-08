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
        const elements = Page.Helpers.Utils.selectorAll<HTMLButtonElement>(document, "button[id]");
        return elements.map((element: HTMLButtonElement) => {
            return new Button(element);
        });
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

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

    namespace Cache {
        type ButtonsCache = { [id: string]: Button };

        function loadCache(): ButtonsCache {
            const result: ButtonsCache = {};

            const elements = document.querySelectorAll("button[id]") as NodeListOf<HTMLButtonElement>;
            for (let i = 0; i < elements.length; i++) {
                const button = new Button(elements[i]);
                result[button.id] = button;
            }

            return result;
        }

        let buttonsCache: ButtonsCache;

        export function getButtonById(id: string): Button | null {
            if (typeof buttonsCache === "undefined") {
                buttonsCache = loadCache();
            }
            return buttonsCache[id] || null;
        }
    }

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(buttonId: string, observer: ButtonObserver): boolean {
        const button = Cache.getButtonById(buttonId);
        if (button) {
            button.observers.push(observer);
            return true;
        }
        return false;
    }

    export function setLabel(buttonId: string, label: string): void {
        const button = Cache.getButtonById(buttonId);
        if (button) {
            button.label = label;
        }
    }
}

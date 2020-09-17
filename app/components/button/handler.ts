// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Button {
    function getButtonById(id: string): HTMLButtonElement | null {
        const selector = "button[id=" + id + "]";
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find button '" + id + "'.");
        }
        return elt as HTMLButtonElement;
    }

    type ButtonObserver = () => unknown;

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addObserver(buttonId: string, observer: ButtonObserver): boolean {
        const elt = getButtonById(buttonId);
        if (elt) {
            elt.addEventListener("click", (event: MouseEvent) => {
                event.stopPropagation();
                observer();
            }, false);
            return true;
        }

        return false;
    }

    export function setLabel(buttonId: string, label: string): void {
        const elt = getButtonById(buttonId);
        if (elt) {
            elt.innerText = label;
        }
    }
}

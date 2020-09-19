// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Controls {
    function getElementBySelector(selector: string): HTMLElement | null {
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find control '" + selector + "'.");
        }
        return elt as HTMLElement;
    }

    export function setVisibility(id: string, visible: boolean): void {
        const control = getElementBySelector("div#control-" + id);
        if (control) {
            control.style.display = visible ? "" : "none";
        }
    }
}

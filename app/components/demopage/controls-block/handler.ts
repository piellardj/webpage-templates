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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Sections {
    function getElementBySelector(selector: string): HTMLElement | null {
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find section '" + selector + "'.");
        }
        return elt as HTMLElement;
    }

    function reevaluateSeparatorsVisibility(controlsBlockElement: HTMLElement): void {
        function isHr(element: HTMLElement): boolean {
            return element.tagName.toLowerCase() === "hr";
        }
        function isVisible(element: HTMLElement): boolean {
            return element.style.display !== "none";
        }

        const sectionsOrHr = controlsBlockElement.querySelectorAll("section, hr") as NodeListOf<HTMLElement>;

        //remove duplicate HRs
        let lastWasHr = false;
        for (let i = 0; i < sectionsOrHr.length; i++) {
            if (isHr(sectionsOrHr[i])) {
                sectionsOrHr[i].style.display = lastWasHr ? "none" : "";
                lastWasHr = true;
            } else if (isVisible(sectionsOrHr[i])) {
                lastWasHr = false;
            }
        }

        // remove leading HRs
        for (let i = 0; i < sectionsOrHr.length; i++) {
            if (isHr(sectionsOrHr[i])) {
                sectionsOrHr[i].style.display = "none";
            } else if (isVisible(sectionsOrHr[i])) {
                break;
            }
        }

        // remove trailing HRs
        for (let i = sectionsOrHr.length - 1; i >= 0; i--) {
            if (isHr(sectionsOrHr[i])) {
                sectionsOrHr[i].style.display = "none";
            } else if (isVisible(sectionsOrHr[i])) {
                break;
            }
        }
    }

    export function setVisibility(id: string, visible: boolean): void {
        const section = getElementBySelector("section#section-" + id);
        if (section) {
            section.style.display = visible ? "" : "none";
            reevaluateSeparatorsVisibility(section.parentElement);
        }
    }
}

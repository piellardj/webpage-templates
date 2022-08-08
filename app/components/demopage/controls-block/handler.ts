/// <reference path="../../helpers.ts"/>

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

        const sectionsOrHr = Page.Helpers.Utils.selectorAll(controlsBlockElement, "section, hr");

        //remove duplicate HRs
        let lastWasHr = false;
        for (const sectionOrHr of sectionsOrHr) {
            if (isHr(sectionOrHr)) {
                sectionOrHr.style.display = lastWasHr ? "none" : "";
                lastWasHr = true;
            } else if (isVisible(sectionOrHr)) {
                lastWasHr = false;
            }
        }

        // remove leading HRs
        for (const sectionOrHr of sectionsOrHr) {
            if (isHr(sectionOrHr)) {
                sectionOrHr.style.display = "none";
            } else if (isVisible(sectionOrHr)) {
                break;
            }
        }

        // remove trailing HRs
        for (let i = sectionsOrHr.length - 1; i >= 0; i--) {
            const sectionOrHr = sectionsOrHr[i]!;
            if (isHr(sectionOrHr)) {
                sectionOrHr.style.display = "none";
            } else if (isVisible(sectionOrHr)) {
                break;
            }
        }
    }

    export function setVisibility(id: string, visible: boolean): void {
        const section = getElementBySelector("section#section-" + id);
        if (section && section.parentElement) {
            section.style.display = visible ? "" : "none";
            reevaluateSeparatorsVisibility(section.parentElement);
        }
    }
}

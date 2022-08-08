/// <reference path="../../helpers.ts"/>
var Page;
(function (Page) {
    var Controls;
    (function (Controls) {
        function getElementBySelector(selector) {
            var elt = document.querySelector(selector);
            if (!elt) {
                console.error("Cannot find control '" + selector + "'.");
            }
            return elt;
        }
        function setVisibility(id, visible) {
            var control = getElementBySelector("div#control-" + id);
            if (control) {
                control.style.display = visible ? "" : "none";
            }
        }
        Controls.setVisibility = setVisibility;
    })(Controls = Page.Controls || (Page.Controls = {}));
})(Page || (Page = {}));
(function (Page) {
    var Sections;
    (function (Sections) {
        function getElementBySelector(selector) {
            var elt = document.querySelector(selector);
            if (!elt) {
                console.error("Cannot find section '" + selector + "'.");
            }
            return elt;
        }
        function reevaluateSeparatorsVisibility(controlsBlockElement) {
            function isHr(element) {
                return element.tagName.toLowerCase() === "hr";
            }
            function isVisible(element) {
                return element.style.display !== "none";
            }
            var sectionsOrHr = Page.Helpers.Utils.selectorAll(controlsBlockElement, "section, hr");
            //remove duplicate HRs
            var lastWasHr = false;
            for (var _i = 0, sectionsOrHr_1 = sectionsOrHr; _i < sectionsOrHr_1.length; _i++) {
                var sectionOrHr = sectionsOrHr_1[_i];
                if (isHr(sectionOrHr)) {
                    sectionOrHr.style.display = lastWasHr ? "none" : "";
                    lastWasHr = true;
                }
                else if (isVisible(sectionOrHr)) {
                    lastWasHr = false;
                }
            }
            // remove leading HRs
            for (var _a = 0, sectionsOrHr_2 = sectionsOrHr; _a < sectionsOrHr_2.length; _a++) {
                var sectionOrHr = sectionsOrHr_2[_a];
                if (isHr(sectionOrHr)) {
                    sectionOrHr.style.display = "none";
                }
                else if (isVisible(sectionOrHr)) {
                    break;
                }
            }
            // remove trailing HRs
            for (var i = sectionsOrHr.length - 1; i >= 0; i--) {
                var sectionOrHr = sectionsOrHr[i];
                if (isHr(sectionOrHr)) {
                    sectionOrHr.style.display = "none";
                }
                else if (isVisible(sectionOrHr)) {
                    break;
                }
            }
        }
        function setVisibility(id, visible) {
            var section = getElementBySelector("section#section-" + id);
            if (section && section.parentElement) {
                section.style.display = visible ? "" : "none";
                reevaluateSeparatorsVisibility(section.parentElement);
            }
        }
        Sections.setVisibility = setVisibility;
    })(Sections = Page.Sections || (Page.Sections = {}));
})(Page || (Page = {}));

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
            var sectionsOrHr = controlsBlockElement.querySelectorAll("section, hr");
            //remove duplicate HRs
            var lastWasHr = false;
            for (var i = 0; i < sectionsOrHr.length; i++) {
                if (isHr(sectionsOrHr[i])) {
                    sectionsOrHr[i].style.display = lastWasHr ? "none" : "";
                    lastWasHr = true;
                }
                else if (isVisible(sectionsOrHr[i])) {
                    lastWasHr = false;
                }
            }
            // remove leading HRs
            for (var i = 0; i < sectionsOrHr.length; i++) {
                if (isHr(sectionsOrHr[i])) {
                    sectionsOrHr[i].style.display = "none";
                }
                else if (isVisible(sectionsOrHr[i])) {
                    break;
                }
            }
            // remove trailing HRs
            for (var i = sectionsOrHr.length - 1; i >= 0; i--) {
                if (isHr(sectionsOrHr[i])) {
                    sectionsOrHr[i].style.display = "none";
                }
                else if (isVisible(sectionsOrHr[i])) {
                    break;
                }
            }
        }
        function setVisibility(id, visible) {
            var section = getElementBySelector("section#section-" + id);
            if (section) {
                section.style.display = visible ? "" : "none";
                reevaluateSeparatorsVisibility(section.parentElement);
            }
        }
        Sections.setVisibility = setVisibility;
    })(Sections = Page.Sections || (Page.Sections = {}));
})(Page || (Page = {}));

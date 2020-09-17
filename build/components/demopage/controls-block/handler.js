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
})(Controls || (Controls = {}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
var RangeControl;
(function (RangeControl) {
    function isRangeElement(elt) {
        return elt.type && elt.type.toLowerCase() === "range";
    }
    function getRangeById(id) {
        var selector = "input[type=range][id=" + id + "]";
        var elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find range '" + selector + "'.");
        }
        return elt;
    }
    var thumbSize = 16;
    function updateTooltipPosition(range, tooltip) {
        tooltip.textContent = range.value;
        var bodyRect = document.body.getBoundingClientRect();
        var rangeRect = range.getBoundingClientRect();
        var tooltipRect = tooltip.getBoundingClientRect();
        var percentage = (+range.value - +range.min) / (+range.max - +range.min);
        var top = (rangeRect.top - tooltipRect.height - bodyRect.top) - 4;
        var middle = percentage * (rangeRect.width - thumbSize) +
            (rangeRect.left + 0.5 * thumbSize) - bodyRect.left;
        tooltip.style.top = top + "px";
        tooltip.style.left = (middle - 0.5 * tooltipRect.width) + "px";
    }
    window.addEventListener("load", function () {
        var tooltips = document.querySelectorAll(".tooltip");
        Array.prototype.forEach.call(tooltips, function (tooltip) {
            var range = tooltip.previousElementSibling;
            if (isRangeElement(range)) {
                range.parentNode.addEventListener("mouseenter", function () {
                    updateTooltipPosition(range, tooltip);
                }, false);
                range.addEventListener("input", function () {
                    updateTooltipPosition(range, tooltip);
                }, false);
            }
        });
    });
    /**
     * @return {boolean} Whether or not the observer was added
     */
    function addObserverInternal(rangeId, observer, eventName) {
        var elt = getRangeById(rangeId);
        if (elt) {
            elt.addEventListener(eventName, function (event) {
                event.stopPropagation();
                observer(+elt.value);
            }, false);
            return true;
        }
        return false;
    }
    var isIE11 = !!window.MSInputMethodContext && !!document["documentMode"];
    /**
     * Callback will be called every time the value changes.
     * @return {boolean} Whether or not the observer was added
     */
    function addObserver(rangeId, observer) {
        if (isIE11) { // bug in IE 11, input event is never fired
            return addObserverInternal(rangeId, observer, "change");
        }
        else {
            return addObserverInternal(rangeId, observer, "input");
        }
    }
    RangeControl.addObserver = addObserver;
    /**
     * Callback will be called only when the value stops changing.
     * @return {boolean} Whether or not the observer was added
     */
    function addLazyObserver(rangeId, observer) {
        return addObserverInternal(rangeId, observer, "change");
    }
    RangeControl.addLazyObserver = addLazyObserver;
    function getValue(rangeId) {
        var elt = getRangeById(rangeId);
        if (!elt) {
            return null;
        }
        return +elt.value;
    }
    RangeControl.getValue = getValue;
    function setValue(rangeId, value) {
        var elt = getRangeById(rangeId);
        if (elt) {
            elt.value = "" + value;
        }
    }
    RangeControl.setValue = setValue;
})(RangeControl || (RangeControl = {}));
eval("Range = RangeControl;"); // for legacy compatibility

/* exported Range */
const Range = (function() {
    /**
     * @param {Object} elt Html node element
     * @return {boolean}
     */
    function isRangeElement(elt) {
        return elt.type && elt.type.toLowerCase() === "range";
    }

    /**
     * @param {string} id
     * @return {Object} Html node or null if not found
     */
    function getRangeById(id) {
        const selector = "input[type=range][id=" + id + "]";
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find range '" + selector + "'.");
        }
        return elt;
    }

    /**
     * @param {string} rangeId
     * @param {Object} observer Callback method
     * @param {string} eventName Event on which the callback is called
     * @return {boolean} Whether or not the observer was added
     */
    function addObserver(rangeId, observer, eventName) {
        const elt = getRangeById(rangeId);
        if (elt) {
            elt.addEventListener(eventName, function(event) {
                event.stopPropagation();
                observer(+elt.value);
            }, false);
            return true;
        }

        return false;
    }

    const thumbSize = 16;
    /**
     *
     * @param {Object} range    Node element
     * @param {Object} tooltip  Node element
     * @return {void}
     */
    function updateTooltipPosition(range, tooltip) {
        tooltip.textContent = range.value;

        const bodyRect = document.body.getBoundingClientRect();
        const rangeRect = range.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        const percentage = (range.value - range.min) / (range.max - range.min);

        const top = (rangeRect.top - tooltipRect.height - bodyRect.top) - 4;
        const middle = percentage * (rangeRect.width - thumbSize) +
            (rangeRect.left + 0.5*thumbSize) - bodyRect.left;

        tooltip.style.top = top + "px";
        tooltip.style.left = (middle - 0.5 * tooltipRect.width) + "px";
    }

    window.addEventListener("load", function() {
        const tooltips = document.querySelectorAll(".tooltip");
        Array.prototype.forEach.call(tooltips, function(tooltip) {
            const range = tooltip.previousElementSibling;
            if (isRangeElement(range)) {
                range.parentNode.addEventListener("mouseenter", function() {
                    updateTooltipPosition(range, tooltip);
                }, false);

                range.addEventListener("input", function() {
                    updateTooltipPosition(range, tooltip);
                }, false);
            }
        });
    });

    const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

    return Object.freeze({
        /**
         * Callback will be called every time the value changes.
         * @param {string} rangeId
         * @param {Object} observer Callback method
         * @return {boolean} Whether or not the observer was added
         */
        addObserver: function(rangeId, observer) {
            if (isIE11) { // bug in IE 11, input event is never fired
                return addObserver(rangeId, observer, "change");
            } else {
                return addObserver(rangeId, observer, "input");
            }
        },

        /**
         * Callback will be called only when the value stops changing.
         * @param {string} rangeId
         * @param {Object} observer Callback method
         * @return {boolean} Whether or not the observer was added
         */
        addLazyObserver: function(rangeId, observer) {
            return addObserver(rangeId, observer, "change");
        },

        /**
         * @param {string} rangeId
         * @return {number}
         */
        getValue: function(rangeId) {
            const elt = getRangeById(rangeId);
            if (!elt) {
                return null;
            }
            return +elt.value;
        },

        /**
         * @param {string} rangeId
         * @param {number} value
         */
        setValue: function(rangeId, value) {
            const elt = getRangeById(rangeId);
            if (elt) {
                elt.value = value;
            }
        },
    });
})();

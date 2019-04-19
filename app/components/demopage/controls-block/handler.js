/* exported Controls */
const Controls = (function() {
    /**
     * @param {string} selector
     * @return {Object} Html node or null if not found
     */
    function getElementBySelector(selector) {
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find control '" + selector + "'.");
        }
        return elt;
    }

    return Object.freeze({
        /**
         * @param {string} id
         * @param {boolean} visible
         */
        setVisibility: function(id, visible) {
            const control = getElementBySelector("div#control-" + id);
            if (control) {
                control.style.display = visible ? "" : "none";
            }
        },
    });
})();

/* exported Checkbox */
const Checkbox = (function() {
    /**
     * @param {string} id
     * @return {Object} Html node or null if not found
     */
    function getCheckboxFromId(id) {
        const selector = "input[type=checkbox][id=" + id + "]";
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find checkbox '" + selector + "'.");
        }
        return elt;
    }

    return Object.freeze({
        /**
         * @param {string} checkboxId
         * @param {Object} observer Callback method
         * @return {boolean} Whether or not the observer was added
         */
        addObserver: function(checkboxId, observer) {
            const elt = getCheckboxFromId(checkboxId);
            if (elt) {
                elt.addEventListener("change", function(event) {
                    event.stopPropagation();
                    observer(event.target.checked);
                }, false);
                return true;
            }

            return false;
        },

        /**
         * @param {string} checkboxId
         * @param {boolean} value
         * @return {void}
         */
        setChecked: function(checkboxId, value) {
            const elt = getCheckboxFromId(checkboxId);
            if (elt) {
                elt.checked = value ? true : false;
            }
        },

        /**
         * @param {string} checkboxId
         * @return {boolean}
         */
        isChecked: function(checkboxId) {
            const elt = getCheckboxFromId(checkboxId);
            return elt && elt.checked;
        },
    });
})();

/* exported Button */
const Button = (function() {
    /**
     * @param {string} id
     * @return {Object} Html node or null if not found
     */
    function getButtonById(id) {
        const selector = "button[id=" + id + "]";
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find button '" + checkboxId + "'.");
        }
        return elt;
    }

    return Object.freeze({
        /**
         * @param {string} buttonId
         * @param {Object} observer Callback function
         * @return {boolean} Whether or not the observer was added
         */
        addObserver: function(buttonId, observer) {
            const elt = getButtonById(buttonId);
            if (elt) {
                elt.addEventListener("click", function(event) {
                    event.stopPropagation();
                    observer();
                }, false);
                return true;
            }

            return false;
        },

        /**
         * @param {string} buttonId
         * @param {string} label
         */
        setLabel: function(buttonId, label) {
            const elt = getButtonById(buttonId);
            if (elt) {
                elt.innerText = label;
            }
        },
    });
})();

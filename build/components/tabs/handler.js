/* exported Tabs */
const Tabs = (function() {
    /**
     * @param {string} id
     * @return {Object} Html node or null if not found
     */
    function getTabsById(id) {
        const selector = "div.tabs[id=" + id + "-id]";
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find tabs '" + selector + "'.");
        }
        return elt;
    }

    /**
     * @param {Object} tabsElt Node tab element
     * @return {string[]}
     */
    function getSelectedValues(tabsElt) {
        const values = [];
        const inputs = tabsElt.querySelectorAll("input");
        Array.prototype.forEach.call(inputs, function(input) {
            if (input.checked) {
                values.push(input.value);
            }
        });

        return values;
    }

    return Object.freeze({
        /**
         * @param {string} tabsId
         * @param {Object} observer Callback method
         * @return {boolean} Whether or not the observer was added
         */
        addObserver: function(tabsId, observer) {
            const divWrapper = getTabsById(tabsId);
            if (divWrapper) {
                const inputs = divWrapper.querySelectorAll("input");
                Array.prototype.forEach.call(inputs, function(input) {
                    input.addEventListener("change", function(event) {
                        event.stopPropagation();
                        observer(getSelectedValues(divWrapper));
                    }, false);
                });
                return true;
            }

            return false;
        },

        /**
         * @param {string} tabsId
         * @return {string[]}
         */
        getValues: function(tabsId) {
            const divWrapper = getTabsById(tabsId);
            if (!divWrapper) {
                return [];
            }

            return getSelectedValues(divWrapper);
        },

        /**
         * @param {sting} tabsId
         * @param {string[]} values
         * @return {void}
         */
        setValues: function(tabsId, values) {
            const divWrapper = getTabsById(tabsId);
            const inputs = divWrapper.querySelectorAll("input");
            Array.prototype.forEach.call(inputs, function(input) {
                input.checked = false;
            });

            for (let i = 0; i < values.length; ++i) {
                const id = tabsId + "-" + values[i] + "-id";
                divWrapper.querySelector("input[id=" + id + "]").checked = true;
            }
        },
    });
})();

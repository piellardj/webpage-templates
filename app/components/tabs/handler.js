/* exported Tabs */
const Tabs = (function() {
    /**
     * @param {string} group
     * @return {Object} Html node or null if not found
     */
    function getTabsByGroup(group) {
        const selector = "div.tabs[id=" + group + "-id]";
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

        tabsElt.querySelectorAll("input").forEach(function(input) {
            if (input.checked) {
                values.push(input.value);
            }
        });

        return values;
    }

    return Object.freeze({
        /**
         * @param {string} tabsGroup
         * @param {Object} observer Callback method
         * @return {boolean} Whether or not the observer was added
         */
        addObserver: function(tabsGroup, observer) {
            const divWrapper = getTabsByGroup(tabsGroup);
            if (divWrapper) {
                divWrapper.querySelectorAll("input").forEach(function(input) {
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
         * @param {string} tabsGroup
         * @return {string[]}
         */
        getValues: function(tabsGroup) {
            const divWrapper = getTabsByGroup(tabsGroup);
            if (!divWrapper) {
                return [];
            }

            return getSelectedValues(divWrapper);
        },

        /**
         * @param {sting} tabsGroup
         * @param {string[]} values
         * @return {void}
         */
        setValues: function(tabsGroup, values) {
            const divWrapper = getTabsByGroup(tabsGroup);
            divWrapper.querySelectorAll("input").forEach(function(input) {
                input.checked = false;
            });

            for (let i = 0; i < values.length; ++i) {
                const id = tabsGroup + "-" + values[i] + "-id";
                divWrapper.querySelector("input[id=" + id + "]").checked = true;
            }
        },
    });
})();

var Tabs;
(function (Tabs) {
    function getTabsById(id) {
        var selector = "div.tabs[id=" + id + "-id]";
        var elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find tabs '" + selector + "'.");
        }
        return elt;
    }
    /**
     * @param {Object} tabsElt Node tab element
     */
    function getSelectedValues(tabsElt) {
        var values = [];
        var inputs = tabsElt.querySelectorAll("input");
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (input.checked) {
                values.push(input.value);
            }
        }
        return values;
    }
    /**
     * @return {boolean} Whether or not the observer was added
     */
    function addObserver(tabsId, observer) {
        var divWrapper = getTabsById(tabsId);
        if (divWrapper) {
            var inputs = divWrapper.querySelectorAll("input");
            Array.prototype.forEach.call(inputs, function (input) {
                input.addEventListener("change", function (event) {
                    event.stopPropagation();
                    observer(getSelectedValues(divWrapper));
                }, false);
            });
            return true;
        }
        return false;
    }
    Tabs.addObserver = addObserver;
    function getValues(tabsId) {
        var divWrapper = getTabsById(tabsId);
        if (!divWrapper) {
            return [];
        }
        return getSelectedValues(divWrapper);
    }
    Tabs.getValues = getValues;
    function setValues(tabsId, values) {
        var divWrapper = getTabsById(tabsId);
        var inputs = divWrapper.querySelectorAll("input");
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].checked = false;
        }
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var value = values_1[_i];
            var id = tabsId + "-" + value + "-id";
            var inputElement = divWrapper.querySelector("input[id=" + id + "]");
            inputElement.checked = true;
        }
    }
    Tabs.setValues = setValues;
})(Tabs || (Tabs = {}));

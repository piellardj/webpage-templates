/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var Tabs;
    (function (Tabs) {
        var ID_SUFFIX = "-id";
        function getTabsById(id) {
            var selector = "div.tabs[id=" + id + ID_SUFFIX + "]";
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
        var Storage;
        (function (Storage) {
            var PREFIX = "tabs";
            var SEPARATOR = ";";
            function attachStorageEvents() {
                var tabsElements = document.querySelectorAll("div.tabs[id]");
                tabsElements.forEach(function (tabsElement) {
                    var fullId = tabsElement.id;
                    if (fullId.indexOf(ID_SUFFIX, fullId.length - ID_SUFFIX.length) !== -1) {
                        var id_1 = fullId.substring(0, fullId.length - ID_SUFFIX.length);
                        var saveTabsState = function () {
                            var valuesList = getSelectedValues(tabsElement);
                            var values = valuesList.join(SEPARATOR);
                            Page.Helpers.URL.setQueryParameter(PREFIX, id_1, values);
                        };
                        var inputs = tabsElement.querySelectorAll("input");
                        for (var i = 0; i < inputs.length; i++) {
                            inputs[i].addEventListener("change", saveTabsState);
                        }
                    }
                });
            }
            Storage.attachStorageEvents = attachStorageEvents;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (controlId, value) {
                    var values = value.split(SEPARATOR);
                    if (!getTabsById(controlId)) {
                        console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                    }
                    else {
                        setValues(controlId, values);
                    }
                });
            }
            Storage.applyStoredState = applyStoredState;
        })(Storage || (Storage = {}));
        Storage.applyStoredState();
        Storage.attachStorageEvents();
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
    })(Tabs = Page.Tabs || (Page.Tabs = {}));
})(Page || (Page = {}));

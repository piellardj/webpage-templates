/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var Checkbox;
    (function (Checkbox) {
        function getCheckboxFromId(id) {
            var selector = "input[type=checkbox][id=" + id + "]";
            var elt = document.querySelector(selector);
            if (!elt) {
                console.error("Cannot find checkbox '" + selector + "'.");
            }
            return elt;
        }
        var Storage;
        (function (Storage) {
            var PREFIX = "checkbox";
            var CHECKED = "true";
            var UNCHECKED = "false";
            function attachStorageEvents() {
                var checkboxesSelector = "div.checkbox > input[type=checkbox][id]";
                var checkboxes = document.querySelectorAll(checkboxesSelector);
                var _loop_1 = function (i) {
                    var checkbox = checkboxes[i];
                    checkbox.addEventListener("change", function () {
                        var value = checkbox.checked ? CHECKED : UNCHECKED;
                        Page.Helpers.URL.setQueryParameter(PREFIX, checkbox.id, value);
                    });
                };
                for (var i = 0; i < checkboxes.length; i++) {
                    _loop_1(i);
                }
            }
            Storage.attachStorageEvents = attachStorageEvents;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (checkboxId, value) {
                    var input = getCheckboxFromId(checkboxId);
                    if (!input || (value !== CHECKED && value !== UNCHECKED)) {
                        console.log("Removing invalid query parameter '" + checkboxId + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(PREFIX, checkboxId);
                    }
                    else {
                        input.checked = (value === CHECKED);
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
        function addObserver(checkboxId, observer) {
            var elt = getCheckboxFromId(checkboxId);
            if (elt) {
                elt.addEventListener("change", function (event) {
                    event.stopPropagation();
                    observer(elt.checked);
                }, false);
                return true;
            }
            return false;
        }
        Checkbox.addObserver = addObserver;
        function setChecked(checkboxId, value) {
            var elt = getCheckboxFromId(checkboxId);
            if (elt) {
                elt.checked = value ? true : false;
            }
        }
        Checkbox.setChecked = setChecked;
        function isChecked(checkboxId) {
            var elt = getCheckboxFromId(checkboxId);
            return !!elt && elt.checked;
        }
        Checkbox.isChecked = isChecked;
    })(Checkbox = Page.Checkbox || (Page.Checkbox = {}));
})(Page || (Page = {}));

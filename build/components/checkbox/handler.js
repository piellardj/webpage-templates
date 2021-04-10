/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var Checkbox;
    (function (Checkbox_1) {
        var Checkbox = /** @class */ (function () {
            function Checkbox(element) {
                var _this = this;
                this.observers = [];
                this.id = element.id;
                this.element = element;
                this.reloadValue();
                this.element.addEventListener("change", function () {
                    _this.reloadValue();
                    Storage.storeState(_this);
                    for (var _i = 0, _a = _this.observers; _i < _a.length; _i++) {
                        var observer = _a[_i];
                        observer(_this.checked);
                    }
                });
            }
            Object.defineProperty(Checkbox.prototype, "checked", {
                get: function () {
                    return this._checked;
                },
                set: function (newChecked) {
                    this.element.checked = newChecked;
                    this.reloadValue();
                },
                enumerable: false,
                configurable: true
            });
            Checkbox.prototype.reloadValue = function () {
                this._checked = this.element.checked;
            };
            return Checkbox;
        }());
        var Cache;
        (function (Cache) {
            function loadCache() {
                var result = {};
                var selector = "div.checkbox > input[type=checkbox][id]";
                var elements = document.querySelectorAll(selector);
                for (var i = 0; i < elements.length; i++) {
                    var checkbox = new Checkbox(elements[i]);
                    result[checkbox.id] = checkbox;
                }
                return result;
            }
            var checkboxesCache;
            function getCheckboxById(id) {
                Cache.load();
                return checkboxesCache[id] || null;
            }
            Cache.getCheckboxById = getCheckboxById;
            function load() {
                if (typeof checkboxesCache === "undefined") {
                    checkboxesCache = loadCache();
                }
            }
            Cache.load = load;
        })(Cache || (Cache = {}));
        var Storage;
        (function (Storage) {
            var PREFIX = "checkbox";
            var CHECKED = "true";
            var UNCHECKED = "false";
            function storeState(checkbox) {
                var stateAsString = checkbox.checked ? CHECKED : UNCHECKED;
                Page.Helpers.URL.setQueryParameter(PREFIX, checkbox.id, stateAsString);
            }
            Storage.storeState = storeState;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (checkboxId, value) {
                    var checkbox = Cache.getCheckboxById(checkboxId);
                    if (!checkbox || (value !== CHECKED && value !== UNCHECKED)) {
                        console.log("Removing invalid query parameter '" + checkboxId + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(PREFIX, checkboxId);
                    }
                    else {
                        checkbox.checked = (value === CHECKED);
                    }
                });
            }
            Storage.applyStoredState = applyStoredState;
        })(Storage || (Storage = {}));
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            Cache.load();
            Storage.applyStoredState();
        });
        /**
         * @return {boolean} Whether or not the observer was added
         */
        function addObserver(checkboxId, observer) {
            var checkbox = Cache.getCheckboxById(checkboxId);
            if (checkbox) {
                checkbox.observers.push(observer);
                return true;
            }
            return false;
        }
        Checkbox_1.addObserver = addObserver;
        function setChecked(checkboxId, value) {
            var checkbox = Cache.getCheckboxById(checkboxId);
            if (checkbox) {
                checkbox.checked = value;
            }
        }
        Checkbox_1.setChecked = setChecked;
        function isChecked(checkboxId) {
            var checkbox = Cache.getCheckboxById(checkboxId);
            if (checkbox) {
                return checkbox.checked;
            }
            return false;
        }
        Checkbox_1.isChecked = isChecked;
    })(Checkbox = Page.Checkbox || (Page.Checkbox = {}));
})(Page || (Page = {}));

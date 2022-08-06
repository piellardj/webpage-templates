/// <reference path="../helpers.ts"/>
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
                    _this.callObservers();
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
            Checkbox.prototype.callObservers = function () {
                for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                    var observer = _a[_i];
                    observer(this.checked);
                }
            };
            Checkbox.prototype.reloadValue = function () {
                this._checked = this.element.checked;
            };
            return Checkbox;
        }());
        var checkboxesCache = new Page.Helpers.Cache("Checkbox", function () {
            var checkboxesList = [];
            var selector = "div.checkbox > input[type=checkbox][id]";
            var elements = document.querySelectorAll(selector);
            for (var i = 0; i < elements.length; i++) {
                var checkbox = new Checkbox(elements[i]);
                checkboxesList.push(checkbox);
            }
            return checkboxesList;
        });
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
            function clearStoredState(checkbox) {
                Page.Helpers.URL.removeQueryParameter(PREFIX, checkbox.id);
            }
            Storage.clearStoredState = clearStoredState;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (checkboxId, value) {
                    var checkbox = checkboxesCache.getByIdSafe(checkboxId);
                    if (!checkbox || (value !== CHECKED && value !== UNCHECKED)) {
                        console.log("Removing invalid query parameter '" + checkboxId + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(PREFIX, checkboxId);
                    }
                    else {
                        checkbox.checked = (value === CHECKED);
                        checkbox.callObservers();
                    }
                });
            }
            Storage.applyStoredState = applyStoredState;
        })(Storage || (Storage = {}));
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            checkboxesCache.load();
            Storage.applyStoredState();
        });
        function addObserver(checkboxId, observer) {
            var checkbox = checkboxesCache.getById(checkboxId);
            checkbox.observers.push(observer);
        }
        Checkbox_1.addObserver = addObserver;
        function setChecked(checkboxId, value) {
            var checkbox = checkboxesCache.getById(checkboxId);
            checkbox.checked = value;
        }
        Checkbox_1.setChecked = setChecked;
        function isChecked(checkboxId) {
            var checkbox = checkboxesCache.getById(checkboxId);
            return checkbox.checked;
        }
        Checkbox_1.isChecked = isChecked;
        function storeState(checkboxId) {
            var checkbox = checkboxesCache.getById(checkboxId);
            Storage.storeState(checkbox);
        }
        Checkbox_1.storeState = storeState;
        function clearStoredState(checkboxId) {
            var checkbox = checkboxesCache.getById(checkboxId);
            Storage.clearStoredState(checkbox);
        }
        Checkbox_1.clearStoredState = clearStoredState;
    })(Checkbox = Page.Checkbox || (Page.Checkbox = {}));
})(Page || (Page = {}));

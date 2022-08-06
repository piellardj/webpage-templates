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
                    checkboxesStorage.storeState(_this);
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
        var checkboxesStorage = new Page.Helpers.Storage("checkbox", function (checkbox) {
            return checkbox.checked ? "true" : "false";
        }, function (id, serializedValue) {
            var checkbox = checkboxesCache.getByIdSafe(id);
            if (checkbox && (serializedValue === "true" || serializedValue === "false")) {
                checkbox.checked = (serializedValue === "true");
                checkbox.callObservers();
                return true;
            }
            return false;
        });
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            checkboxesCache.load();
            checkboxesStorage.applyStoredState();
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
            checkboxesStorage.storeState(checkbox);
        }
        Checkbox_1.storeState = storeState;
        function clearStoredState(checkboxId) {
            var checkbox = checkboxesCache.getById(checkboxId);
            checkboxesStorage.clearStoredState(checkbox);
        }
        Checkbox_1.clearStoredState = clearStoredState;
    })(Checkbox = Page.Checkbox || (Page.Checkbox = {}));
})(Page || (Page = {}));

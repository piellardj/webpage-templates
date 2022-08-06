/// <reference path="../helpers.ts"/>
var Page;
(function (Page) {
    var Tabs;
    (function (Tabs_1) {
        var Tabs = /** @class */ (function () {
            function Tabs(container) {
                var _this = this;
                this.observers = [];
                this.id = Tabs.computeShortId(container.id);
                this.inputElements = [];
                var inputElements = container.querySelectorAll("input");
                for (var i = 0; i < inputElements.length; i++) {
                    this.inputElements.push(inputElements[i]);
                    inputElements[i].addEventListener("change", function (event) {
                        event.stopPropagation();
                        _this.reloadValues();
                        Storage.storeState(_this);
                        _this.callObservers();
                    }, false);
                }
                this.reloadValues();
            }
            Tabs.computeShortId = function (fullId) {
                if (fullId.lastIndexOf(Tabs.ID_SUFFIX) != fullId.length - Tabs.ID_SUFFIX.length) {
                    throw new Error("Invalid tabs container id: '" + fullId + "'.");
                }
                return fullId.substring(0, fullId.length - Tabs.ID_SUFFIX.length);
            };
            Object.defineProperty(Tabs.prototype, "values", {
                get: function () {
                    return this._values;
                },
                set: function (newValues) {
                    for (var _i = 0, _a = this.inputElements; _i < _a.length; _i++) {
                        var inputElement = _a[_i];
                        var isWanted = false;
                        for (var _b = 0, newValues_1 = newValues; _b < newValues_1.length; _b++) {
                            var newValue = newValues_1[_b];
                            if (inputElement.value === newValue) {
                                isWanted = true;
                                break;
                            }
                        }
                        inputElement.checked = isWanted;
                    }
                    this.reloadValues();
                },
                enumerable: false,
                configurable: true
            });
            Tabs.prototype.callObservers = function () {
                for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                    var observer = _a[_i];
                    observer(this._values);
                }
            };
            Tabs.prototype.reloadValues = function () {
                var values = [];
                for (var _i = 0, _a = this.inputElements; _i < _a.length; _i++) {
                    var inputElement = _a[_i];
                    if (inputElement.checked) {
                        values.push(inputElement.value);
                    }
                }
                this._values = values;
            };
            Tabs.ID_SUFFIX = "-id";
            return Tabs;
        }());
        var tabsCache = new Page.Helpers.Cache("Tabs", function () {
            var tabsList = [];
            var containerElements = document.querySelectorAll("div.tabs[id]");
            for (var i = 0; i < containerElements.length; i++) {
                var tabs = new Tabs(containerElements[i]);
                tabsList.push(tabs);
            }
            return tabsList;
        });
        var Storage;
        (function (Storage) {
            var PREFIX = "tabs";
            var SEPARATOR = ";";
            function storeState(tabs) {
                var valuesList = tabs.values;
                var values = valuesList.join(SEPARATOR);
                Page.Helpers.URL.setQueryParameter(PREFIX, tabs.id, values);
            }
            Storage.storeState = storeState;
            function clearStoredState(tabs) {
                Page.Helpers.URL.removeQueryParameter(PREFIX, tabs.id);
            }
            Storage.clearStoredState = clearStoredState;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (controlId, value) {
                    var values = value.split(SEPARATOR);
                    var tabs = tabsCache.getByIdSafe(controlId);
                    if (!tabs) {
                        console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                    }
                    else {
                        tabs.values = values;
                        tabs.callObservers();
                    }
                });
            }
            Storage.applyStoredState = applyStoredState;
        })(Storage || (Storage = {}));
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            tabsCache.load();
            Storage.applyStoredState();
        });
        function addObserver(tabsId, observer) {
            var tabs = tabsCache.getById(tabsId);
            tabs.observers.push(observer);
        }
        Tabs_1.addObserver = addObserver;
        function getValues(tabsId) {
            var tabs = tabsCache.getById(tabsId);
            return tabs.values;
        }
        Tabs_1.getValues = getValues;
        function setValues(tabsId, values, updateURLStorage) {
            if (updateURLStorage === void 0) { updateURLStorage = false; }
            var tabs = tabsCache.getById(tabsId);
            tabs.values = values;
            if (updateURLStorage) {
                Storage.storeState(tabs);
            }
        }
        Tabs_1.setValues = setValues;
        function storeState(tabsId) {
            var tabs = tabsCache.getById(tabsId);
            Storage.storeState(tabs);
        }
        Tabs_1.storeState = storeState;
        function clearStoredState(tabsIdd) {
            var tabs = tabsCache.getById(tabsIdd);
            Storage.clearStoredState(tabs);
        }
        Tabs_1.clearStoredState = clearStoredState;
    })(Tabs = Page.Tabs || (Page.Tabs = {}));
})(Page || (Page = {}));

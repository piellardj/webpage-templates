/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        var Cache;
        (function (Cache) {
            function loadCache() {
                var result = {};
                var containerElements = document.querySelectorAll("div.tabs[id]");
                for (var i = 0; i < containerElements.length; i++) {
                    var tabs = new Tabs(containerElements[i]);
                    result[tabs.id] = tabs;
                }
                return result;
            }
            var tabsCache;
            function getTabsById(id) {
                Cache.load();
                return tabsCache[id] || null;
            }
            Cache.getTabsById = getTabsById;
            function load() {
                if (typeof tabsCache === "undefined") {
                    tabsCache = loadCache();
                }
            }
            Cache.load = load;
        })(Cache || (Cache = {}));
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
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (controlId, value) {
                    var values = value.split(SEPARATOR);
                    var tabs = Cache.getTabsById(controlId);
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
            Cache.load();
            Storage.applyStoredState();
        });
        /**
         * @return {boolean} Whether or not the observer was added
         */
        function addObserver(tabsId, observer) {
            var tabs = Cache.getTabsById(tabsId);
            if (tabs) {
                tabs.observers.push(observer);
                return true;
            }
            return false;
        }
        Tabs_1.addObserver = addObserver;
        function getValues(tabsId) {
            var tabs = Cache.getTabsById(tabsId);
            return tabs.values;
        }
        Tabs_1.getValues = getValues;
        function setValues(tabsId, values, updateURLStorage) {
            if (updateURLStorage === void 0) { updateURLStorage = false; }
            var tabs = Cache.getTabsById(tabsId);
            tabs.values = values;
            if (updateURLStorage) {
                Storage.storeState(tabs);
            }
        }
        Tabs_1.setValues = setValues;
    })(Tabs = Page.Tabs || (Page.Tabs = {}));
})(Page || (Page = {}));

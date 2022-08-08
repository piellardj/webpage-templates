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
                var inputElements = Page.Helpers.Utils.selectorAll(container, "input");
                for (var _i = 0, inputElements_1 = inputElements; _i < inputElements_1.length; _i++) {
                    var inputElement = inputElements_1[_i];
                    this.inputElements.push(inputElement);
                    inputElement.addEventListener("change", function (event) {
                        event.stopPropagation();
                        _this.reloadValues();
                        tabsStorage.storeState(_this);
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
            var containerElements = Page.Helpers.Utils.selectorAll(document, "div.tabs[id]");
            return containerElements.map(function (containerElement) {
                return new Tabs(containerElement);
            });
        });
        var tabsStorage = new Page.Helpers.Storage("tabs", function (tabs) {
            var valuesList = tabs.values;
            return valuesList.join(";");
        }, function (id, serializedValue) {
            var values = serializedValue.split(";");
            var tabs = tabsCache.getByIdSafe(id);
            if (tabs) {
                tabs.values = values;
                tabs.callObservers();
                return true;
            }
            return false;
        });
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            tabsCache.load();
            tabsStorage.applyStoredState();
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
                tabsStorage.storeState(tabs);
            }
        }
        Tabs_1.setValues = setValues;
        function storeState(tabsId) {
            var tabs = tabsCache.getById(tabsId);
            tabsStorage.storeState(tabs);
        }
        Tabs_1.storeState = storeState;
        function clearStoredState(tabsIdd) {
            var tabs = tabsCache.getById(tabsIdd);
            tabsStorage.clearStoredState(tabs);
        }
        Tabs_1.clearStoredState = clearStoredState;
    })(Tabs = Page.Tabs || (Page.Tabs = {}));
})(Page || (Page = {}));

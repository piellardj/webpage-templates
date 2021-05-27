/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var Select;
    (function (Select_1) {
        var Select = /** @class */ (function () {
            function Select(container) {
                var _this = this;
                this.observers = [];
                this.id = container.id;
                this.containerElement = container;
                this.currentValueElement = container.querySelector(".select-current-value");
                this.valuesListElement = container.querySelector(".select-values-list");
                this.placeholder = this.valuesListElement.dataset.placeholder;
                this.currentValue = this.currentValueElement.dataset.value;
                this.valueElements = [];
                var elements = this.valuesListElement.querySelectorAll(".select-value[data-value]");
                for (var i = 0; i < elements.length; i++) {
                    this.valueElements.push(elements[i]);
                }
                this.valuesListElement.style.opacity = "0";
                this.valuesListElement.style.display = "block";
                this.valuesListElement.style.width = "auto";
                this.containerElement.style.width = this.valuesListElement.getBoundingClientRect().width + 30 + "px";
                this.valuesListElement.style.width = "";
                this.valuesListElement.style.display = "";
                this.valuesListElement.style.opacity = "";
                document.addEventListener("click", function (event) {
                    var clickedElement = event.target;
                    var isExpanded = _this.containerElement.classList.contains(Select.EXPANDED_CLASS);
                    if (isExpanded) {
                        var clickedOnValuesList = _this.valuesListElement.contains(clickedElement);
                        if (clickedOnValuesList) {
                            for (var _i = 0, _a = _this.valueElements; _i < _a.length; _i++) {
                                var valueElement = _a[_i];
                                if (valueElement.contains(clickedElement)) {
                                    _this.currentValue = valueElement.dataset.value;
                                    _this.currentValueElement.dataset.value = _this.currentValue;
                                    _this.currentValueElement.textContent = valueElement.textContent;
                                    Storage.storeState(_this);
                                    _this.callObservers();
                                }
                            }
                        }
                        _this.containerElement.classList.remove(Select.EXPANDED_CLASS);
                    }
                    else {
                        var clickedOnCurrentValue = _this.currentValueElement.contains(clickedElement);
                        if (clickedOnCurrentValue) {
                            _this.containerElement.classList.add(Select.EXPANDED_CLASS);
                        }
                    }
                });
            }
            Object.defineProperty(Select.prototype, "value", {
                get: function () {
                    return this.currentValue || null;
                },
                set: function (v) {
                    if (v === null) {
                        this.currentValueElement.removeAttribute("data-value");
                        this.currentValueElement.textContent = this.placeholder;
                    }
                    else {
                        for (var _i = 0, _a = this.valueElements; _i < _a.length; _i++) {
                            var valueElement = _a[_i];
                            if (valueElement.dataset.value === v) {
                                this.currentValue = valueElement.dataset.value;
                                this.currentValueElement.dataset.value = valueElement.dataset.value;
                                this.currentValueElement.textContent = valueElement.textContent;
                                return;
                            }
                        }
                        console.log("No \"" + v + "\" value for \"" + this.id + "\" select.");
                    }
                },
                enumerable: false,
                configurable: true
            });
            Select.prototype.callObservers = function () {
                for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                    var observer = _a[_i];
                    observer(this.value);
                }
            };
            Select.EXPANDED_CLASS = "expanded";
            return Select;
        }());
        var Cache;
        (function (Cache) {
            function loadCache() {
                var result = {};
                var containerElements = document.querySelectorAll(".select-container[id]");
                for (var i = 0; i < containerElements.length; i++) {
                    var select = new Select(containerElements[i]);
                    result[select.id] = select;
                }
                return result;
            }
            var selectsCache;
            function getSelectById(id) {
                Cache.load();
                return selectsCache[id] || null;
            }
            Cache.getSelectById = getSelectById;
            function load() {
                if (typeof selectsCache === "undefined") {
                    selectsCache = loadCache();
                }
            }
            Cache.load = load;
        })(Cache || (Cache = {}));
        var Storage;
        (function (Storage) {
            var PREFIX = "select";
            function storeState(select) {
                Page.Helpers.URL.setQueryParameter(PREFIX, select.id, select.value);
            }
            Storage.storeState = storeState;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (controlId, value) {
                    var select = Cache.getSelectById(controlId);
                    if (!select) {
                        console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                    }
                    else {
                        select.value = value;
                        select.callObservers();
                    }
                });
            }
            Storage.applyStoredState = applyStoredState;
        })(Storage || (Storage = {}));
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            Cache.load();
            Storage.applyStoredState();
        });
        function addObserver(id, observer) {
            var select = Cache.getSelectById(id);
            select.observers.push(observer);
        }
        Select_1.addObserver = addObserver;
        function getValue(id) {
            var select = Cache.getSelectById(id);
            return select.value;
        }
        Select_1.getValue = getValue;
        function setValue(id, value, updateURLStorage) {
            if (updateURLStorage === void 0) { updateURLStorage = false; }
            var select = Cache.getSelectById(id);
            select.value = value;
            if (updateURLStorage) {
                Storage.storeState(select);
            }
        }
        Select_1.setValue = setValue;
    })(Select = Page.Select || (Page.Select = {}));
})(Page || (Page = {}));

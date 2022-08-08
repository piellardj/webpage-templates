/// <reference path="../helpers.ts"/>
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
                this.currentValueElement = Page.Helpers.Utils.selector(container, ".select-current-value");
                this.valuesListElement = Page.Helpers.Utils.selector(container, ".select-values-list");
                this.placeholder = this.valuesListElement.dataset["placeholder"] || "";
                this.currentValue = this.currentValueElement.dataset["value"] || null;
                this.valueElements = [];
                var elements = this.valuesListElement.querySelectorAll(".select-value[data-value]");
                for (var i = 0; i < elements.length; i++) {
                    this.valueElements.push(elements[i]);
                }
                this.containerElement.style.width = "".concat(this.computeMinimumWidth(), "px");
                document.addEventListener("click", function (event) {
                    var clickedElement = event.target;
                    var isExpanded = _this.containerElement.classList.contains(Select.EXPANDED_CLASS);
                    if (isExpanded) {
                        var clickedOnValuesList = _this.valuesListElement.contains(clickedElement);
                        if (clickedOnValuesList) {
                            for (var _i = 0, _a = _this.valueElements; _i < _a.length; _i++) {
                                var valueElement = _a[_i];
                                if (valueElement.contains(clickedElement)) {
                                    _this.currentValue = valueElement.dataset["value"] || null;
                                    _this.currentValueElement.dataset["value"] = _this.currentValue || undefined;
                                    _this.currentValueElement.textContent = valueElement.textContent;
                                    selectStorage.storeState(_this);
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
                        this.currentValue = null;
                    }
                    else {
                        for (var _i = 0, _a = this.valueElements; _i < _a.length; _i++) {
                            var valueElement = _a[_i];
                            var valueFromHtml = valueElement.dataset["value"];
                            if (valueFromHtml === v) {
                                this.currentValue = valueFromHtml;
                                this.currentValueElement.dataset["value"] = valueFromHtml;
                                this.currentValueElement.textContent = valueElement.textContent;
                                return;
                            }
                        }
                        console.log("No \"".concat(v, "\" value for \"").concat(this.id, "\" select."));
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
            Select.prototype.computeMinimumWidth = function () {
                var result = 0;
                this.valuesListElement.style.opacity = "0";
                this.valuesListElement.style.width = "auto";
                this.valuesListElement.style.fontWeight = "bold";
                this.valuesListElement.style.display = "block";
                var placeholderValue = document.createElement("div");
                placeholderValue.classList.add("select-value");
                placeholderValue.textContent = this.placeholder;
                this.valuesListElement.appendChild(placeholderValue);
                var parentNode = this.containerElement.parentNode;
                if (!parentNode) {
                    throw new Error("Select in not attached");
                }
                var nextSiblingNode = this.containerElement.nextSibling;
                parentNode.removeChild(this.containerElement);
                document.body.appendChild(this.containerElement);
                result = this.valuesListElement.getBoundingClientRect().width;
                document.body.removeChild(this.containerElement);
                parentNode.insertBefore(this.containerElement, nextSiblingNode);
                this.valuesListElement.removeChild(placeholderValue);
                this.valuesListElement.style.display = "";
                this.valuesListElement.style.fontWeight = "";
                this.valuesListElement.style.width = "";
                this.valuesListElement.style.opacity = "";
                var MARGIN = 30;
                return result + MARGIN;
            };
            Select.EXPANDED_CLASS = "expanded";
            return Select;
        }());
        var selectsCache = new Page.Helpers.Cache("Select", function () {
            var containerElements = Page.Helpers.Utils.selectorAll(document, ".select-container[id]");
            return containerElements.map(function (containerElement) {
                return new Select(containerElement);
            });
        });
        var selectStorage = new Page.Helpers.Storage("select", function (select) {
            return select.value;
        }, function (id, serializedValue) {
            var select = selectsCache.getByIdSafe(id);
            if (select) {
                select.value = serializedValue;
                select.callObservers();
                return true;
            }
            return false;
        });
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            selectsCache.load();
            selectStorage.applyStoredState();
        });
        function addObserver(id, observer) {
            var select = selectsCache.getById(id);
            select.observers.push(observer);
        }
        Select_1.addObserver = addObserver;
        function getValue(id) {
            var select = selectsCache.getById(id);
            return select.value;
        }
        Select_1.getValue = getValue;
        function setValue(id, value) {
            var select = selectsCache.getById(id);
            select.value = value;
        }
        Select_1.setValue = setValue;
        function storeState(id) {
            var select = selectsCache.getById(id);
            selectStorage.storeState(select);
        }
        Select_1.storeState = storeState;
        function clearStoredState(id) {
            var select = selectsCache.getById(id);
            selectStorage.clearStoredState(select);
        }
        Select_1.clearStoredState = clearStoredState;
    })(Select = Page.Select || (Page.Select = {}));
})(Page || (Page = {}));

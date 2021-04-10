/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var Range;
    (function (Range_1) {
        var Range = /** @class */ (function () {
            function Range(container) {
                var _this = this;
                this.onInputObservers = [];
                this.onChangeObservers = [];
                this.inputElement = container.querySelector("input[type='range']");
                this.progressLeftElement = container.querySelector(".range-progress-left");
                this.tooltipElement = container.querySelector("output.range-tooltip");
                this.id = this.inputElement.id;
                this.inputElement.addEventListener("input", function (event) {
                    event.stopPropagation();
                    _this.reloadValue();
                    for (var _i = 0, _a = _this.onInputObservers; _i < _a.length; _i++) {
                        var observer = _a[_i];
                        observer(_this.value);
                    }
                });
                this.inputElement.addEventListener("change", function (event) {
                    event.stopPropagation();
                    _this.reloadValue();
                    Storage.storeState(_this);
                });
                this.reloadValue();
            }
            Object.defineProperty(Range.prototype, "value", {
                get: function () {
                    return this._value;
                },
                set: function (newValue) {
                    this.inputElement.value = "" + newValue;
                    this.reloadValue();
                    this.callObservers();
                },
                enumerable: false,
                configurable: true
            });
            Range.prototype.callObservers = function () {
                for (var _i = 0, _a = this.onChangeObservers; _i < _a.length; _i++) {
                    var observer = _a[_i];
                    observer(this.value);
                }
            };
            Range.prototype.updateAppearance = function () {
                var currentLength = +this.inputElement.value - +this.inputElement.min;
                var totalLength = +this.inputElement.max - +this.inputElement.min;
                var progression = currentLength / totalLength;
                progression = Math.max(0, Math.min(1, progression));
                this.progressLeftElement.style.width = (100 * progression) + "%";
                this.tooltipElement.textContent = this.inputElement.value;
            };
            Range.prototype.reloadValue = function () {
                this._value = +this.inputElement.value;
                this.updateAppearance();
            };
            return Range;
        }());
        var Cache;
        (function (Cache) {
            function loadCache() {
                var result = {};
                var selector = ".range-container > input[type='range']";
                var rangeElements = document.querySelectorAll(selector);
                for (var i = 0; i < rangeElements.length; i++) {
                    var container = rangeElements[i].parentElement;
                    var id = rangeElements[i].id;
                    result[id] = new Range(container);
                }
                return result;
            }
            var rangesCache;
            function getRangeById(id) {
                Cache.load();
                return rangesCache[id] || null;
            }
            Cache.getRangeById = getRangeById;
            function load() {
                if (typeof rangesCache === "undefined") {
                    rangesCache = loadCache();
                }
            }
            Cache.load = load;
        })(Cache || (Cache = {}));
        var Storage;
        (function (Storage) {
            var PREFIX = "range";
            function storeState(range) {
                var valueAsString = "" + range.value;
                Page.Helpers.URL.setQueryParameter(PREFIX, range.id, valueAsString);
            }
            Storage.storeState = storeState;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (controlId, value) {
                    var range = Cache.getRangeById(controlId);
                    if (!range) {
                        console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                    }
                    else {
                        range.value = +value;
                    }
                });
            }
            Storage.applyStoredState = applyStoredState;
        })(Storage || (Storage = {}));
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            Cache.load();
            Storage.applyStoredState();
        });
        var isIE11 = !!window.MSInputMethodContext && !!document["documentMode"];
        /**
         * Callback will be called every time the value changes.
         * @return {boolean} Whether or not the observer was added
         */
        function addObserver(rangeId, observer) {
            var range = Cache.getRangeById(rangeId);
            if (range) {
                if (isIE11) { // bug in IE 11, input event is never fired
                    range.onChangeObservers.push(observer);
                }
                else {
                    range.onInputObservers.push(observer);
                }
                return true;
            }
            return false;
        }
        Range_1.addObserver = addObserver;
        /**
         * Callback will be called only when the value stops changing.
         * @return {boolean} Whether or not the observer was added
         */
        function addLazyObserver(rangeId, observer) {
            var range = Cache.getRangeById(rangeId);
            if (range) {
                range.onChangeObservers.push(observer);
                return true;
            }
            return false;
        }
        Range_1.addLazyObserver = addLazyObserver;
        function getValue(rangeId) {
            var range = Cache.getRangeById(rangeId);
            if (!range) {
                return null;
            }
            return range.value;
        }
        Range_1.getValue = getValue;
        function setValue(rangeId, value) {
            var range = Cache.getRangeById(rangeId);
            if (range) {
                range.value = value;
            }
        }
        Range_1.setValue = setValue;
    })(Range = Page.Range || (Page.Range = {}));
})(Page || (Page = {}));

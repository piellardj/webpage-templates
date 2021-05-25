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
                this.nbDecimalsToDisplay = Range.getMaxNbDecimals(+this.inputElement.min, +this.inputElement.max, +this.inputElement.step);
                this.inputElement.addEventListener("input", function (event) {
                    event.stopPropagation();
                    _this.reloadValue();
                    _this.callSpecificObservers(_this.onInputObservers);
                });
                this.inputElement.addEventListener("change", function (event) {
                    event.stopPropagation();
                    _this.reloadValue();
                    Storage.storeState(_this);
                    _this.callSpecificObservers(_this.onChangeObservers);
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
                },
                enumerable: false,
                configurable: true
            });
            Range.prototype.callObservers = function () {
                this.callSpecificObservers(this.onInputObservers);
                this.callSpecificObservers(this.onChangeObservers);
            };
            Range.prototype.callSpecificObservers = function (observers) {
                for (var _i = 0, observers_1 = observers; _i < observers_1.length; _i++) {
                    var observer = observers_1[_i];
                    observer(this.value);
                }
            };
            Range.prototype.updateAppearance = function () {
                var currentLength = +this.inputElement.value - +this.inputElement.min;
                var totalLength = +this.inputElement.max - +this.inputElement.min;
                var progression = currentLength / totalLength;
                progression = Math.max(0, Math.min(1, progression));
                this.progressLeftElement.style.width = (100 * progression) + "%";
                var text;
                if (this.nbDecimalsToDisplay < 0) {
                    text = this.inputElement.value;
                }
                else {
                    text = (+this.inputElement.value).toFixed(this.nbDecimalsToDisplay);
                }
                this.tooltipElement.textContent = text;
            };
            Range.prototype.reloadValue = function () {
                this._value = +this.inputElement.value;
                this.updateAppearance();
            };
            Range.getMaxNbDecimals = function () {
                var numbers = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    numbers[_i] = arguments[_i];
                }
                var nbDecimals = -1;
                for (var _a = 0, numbers_1 = numbers; _a < numbers_1.length; _a++) {
                    var n = numbers_1[_a];
                    var local = Range.nbDecimals(n);
                    if (n < 0) {
                        return -1;
                    }
                    else if (nbDecimals < local) {
                        nbDecimals = local;
                    }
                }
                return nbDecimals;
            };
            Range.nbDecimals = function (x) {
                var xAsString = x.toString();
                if (/^[0-9]+$/.test(xAsString)) {
                    return 0;
                }
                else if (/^[0-9]+\.[0-9]+$/.test(xAsString)) {
                    return xAsString.length - (xAsString.indexOf(".") + 1);
                }
                return -1; // failed to parse
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
                        range.callObservers();
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
        function setValue(rangeId, value, updateUrlStorage) {
            if (updateUrlStorage === void 0) { updateUrlStorage = false; }
            var range = Cache.getRangeById(rangeId);
            if (range) {
                range.value = value;
                if (updateUrlStorage) {
                    Storage.storeState(range);
                }
            }
        }
        Range_1.setValue = setValue;
    })(Range = Page.Range || (Page.Range = {}));
})(Page || (Page = {}));

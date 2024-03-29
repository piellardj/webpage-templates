/// <reference path="../helpers.ts"/>
var Page;
(function (Page) {
    var Range;
    (function (Range_1) {
        var Range = /** @class */ (function () {
            function Range(container) {
                var _this = this;
                this.onInputObservers = [];
                this.onChangeObservers = [];
                this.inputElement = Page.Helpers.Utils.selector(container, "input[type='range']");
                this.progressLeftElement = Page.Helpers.Utils.selector(container, ".range-progress-left");
                this.tooltipElement = Page.Helpers.Utils.selector(container, "output.range-tooltip");
                this.id = this.inputElement.id;
                var inputMin = +this.inputElement.min;
                var inputMax = +this.inputElement.max;
                var inputStep = +this.inputElement.step;
                this.nbDecimalsToDisplay = Range.getMaxNbDecimals(inputMin, inputMax, inputStep);
                this.inputElement.addEventListener("input", function (event) {
                    event.stopPropagation();
                    _this.reloadValue();
                    _this.callSpecificObservers(_this.onInputObservers);
                });
                this.inputElement.addEventListener("change", function (event) {
                    event.stopPropagation();
                    _this.reloadValue();
                    rangesStorage.storeState(_this);
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
        var rangesCache = new Page.Helpers.Cache("Range", function () {
            var selector = ".range-container > input[type='range']";
            var rangeElements = Page.Helpers.Utils.selectorAll(document, selector);
            return rangeElements.map(function (rangeElement) {
                var container = rangeElement.parentElement;
                return new Range(container);
            });
        });
        var rangesStorage = new Page.Helpers.Storage("range", function (range) {
            return "" + range.value;
        }, function (id, serializedValue) {
            var range = rangesCache.getByIdSafe(id);
            if (range) {
                range.value = +serializedValue;
                range.callObservers();
                return true;
            }
            return false;
        });
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            rangesCache.load();
            rangesStorage.applyStoredState();
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
        function addObserver(rangeId, observer) {
            var range = rangesCache.getById(rangeId);
            if (isIE11) { // bug in IE 11, input event is never fired
                range.onChangeObservers.push(observer);
            }
            else {
                range.onInputObservers.push(observer);
            }
        }
        Range_1.addObserver = addObserver;
        /**
         * Callback will be called only when the value stops changing.
         */
        function addLazyObserver(rangeId, observer) {
            var range = rangesCache.getById(rangeId);
            range.onChangeObservers.push(observer);
        }
        Range_1.addLazyObserver = addLazyObserver;
        function getValue(rangeId) {
            var range = rangesCache.getById(rangeId);
            return range.value;
        }
        Range_1.getValue = getValue;
        function setValue(rangeId, value) {
            var range = rangesCache.getById(rangeId);
            range.value = value;
        }
        Range_1.setValue = setValue;
        function storeState(rangeId) {
            var range = rangesCache.getById(rangeId);
            rangesStorage.storeState(range);
        }
        Range_1.storeState = storeState;
        function clearStoredState(rangeId) {
            var range = rangesCache.getById(rangeId);
            rangesStorage.clearStoredState(range);
        }
        Range_1.clearStoredState = clearStoredState;
    })(Range = Page.Range || (Page.Range = {}));
})(Page || (Page = {}));

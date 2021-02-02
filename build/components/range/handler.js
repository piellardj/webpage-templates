/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var Range;
    (function (Range) {
        function update(range) {
            var container = range.parentElement;
            var handle = container.querySelector(".range-handle");
            var leftBar = container.querySelector(".range-bar-left");
            var rightBar = container.querySelector(".range-bar-right");
            var tooltip = container.querySelector("output.range-tooltip");
            var progression = (+range.value - +range.min) / (+range.max - +range.min);
            var width = container.getBoundingClientRect().width;
            var handleSize = handle.getBoundingClientRect().width;
            var handleCenter = 0.5 * handleSize + progression * (width - handleSize);
            leftBar.style.width = handleCenter + "px";
            rightBar.style.width = (width - handleCenter) + "px";
            handle.style.left = handleCenter + "px";
            tooltip.style.left = handleCenter + "px";
            tooltip.textContent = range.value;
        }
        window.addEventListener("load", function () {
            var updateFunctions = [];
            var selector = ".range-container > input[type='range']";
            var rangeElements = document.querySelectorAll(selector);
            var _loop_1 = function (i) {
                var rangeElement = rangeElements[i];
                var updateFunction = function () {
                    update(rangeElement);
                };
                updateFunctions.push(updateFunction);
                rangeElement.addEventListener("input", updateFunction);
                rangeElement.addEventListener("change", updateFunction);
                updateFunction();
            };
            for (var i = 0; i < rangeElements.length; i++) {
                _loop_1(i);
            }
            var updateEverything = function () {
                for (var _i = 0, updateFunctions_1 = updateFunctions; _i < updateFunctions_1.length; _i++) {
                    var updateFunction = updateFunctions_1[_i];
                    updateFunction();
                }
            };
            window.addEventListener("resize", updateEverything);
            setInterval(updateEverything, 1000); // update on a regular basis
        });
        function getRangeById(id) {
            var selector = "input[type=range][id=" + id + "]";
            var elt = document.querySelector(selector);
            if (!elt) {
                console.error("Cannot find range '" + selector + "'.");
            }
            return elt;
        }
        var Storage;
        (function (Storage) {
            var PREFIX = "range";
            function attachStorageEvents() {
                var inputsSelector = "div.range input.slider[type=range][id]";
                var inputElements = document.querySelectorAll(inputsSelector);
                var _loop_2 = function (i) {
                    var inputElement = inputElements[i];
                    inputElement.addEventListener("change", function () {
                        Page.Helpers.URL.setQueryParameter(PREFIX, inputElement.id, inputElement.value);
                    });
                };
                for (var i = 0; i < inputElements.length; i++) {
                    _loop_2(i);
                }
            }
            Storage.attachStorageEvents = attachStorageEvents;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (controlId, value) {
                    var input = getRangeById(controlId);
                    if (!input) {
                        console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                    }
                    else {
                        setValue(controlId, +value);
                    }
                });
            }
            Storage.applyStoredState = applyStoredState;
        })(Storage || (Storage = {}));
        Storage.applyStoredState();
        Storage.attachStorageEvents();
        /**
         * @return {boolean} Whether or not the observer was added
         */
        function addObserverInternal(rangeId, observer, eventName) {
            var elt = getRangeById(rangeId);
            if (elt) {
                elt.addEventListener(eventName, function (event) {
                    event.stopPropagation();
                    observer(+elt.value);
                }, false);
                return true;
            }
            return false;
        }
        var isIE11 = !!window.MSInputMethodContext && !!document["documentMode"];
        /**
         * Callback will be called every time the value changes.
         * @return {boolean} Whether or not the observer was added
         */
        function addObserver(rangeId, observer) {
            if (isIE11) { // bug in IE 11, input event is never fired
                return addObserverInternal(rangeId, observer, "change");
            }
            else {
                return addObserverInternal(rangeId, observer, "input");
            }
        }
        Range.addObserver = addObserver;
        /**
         * Callback will be called only when the value stops changing.
         * @return {boolean} Whether or not the observer was added
         */
        function addLazyObserver(rangeId, observer) {
            return addObserverInternal(rangeId, observer, "change");
        }
        Range.addLazyObserver = addLazyObserver;
        function getValue(rangeId) {
            var elt = getRangeById(rangeId);
            if (!elt) {
                return null;
            }
            return +elt.value;
        }
        Range.getValue = getValue;
        function setValue(rangeId, value) {
            var elt = getRangeById(rangeId);
            if (elt) {
                elt.value = "" + value;
                update(elt);
            }
        }
        Range.setValue = setValue;
    })(Range = Page.Range || (Page.Range = {}));
})(Page || (Page = {}));

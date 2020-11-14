/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var Picker;
    (function (Picker) {
        var DISABLED_BUTTON_CLASS = "disabled";
        /**
         * Populates pickers dictionary and binds events.
         */
        function buildPickersDictionary() {
            var dictionary = {};
            var pickers = document.querySelectorAll(".inline-picker");
            for (var i = 0; i < pickers.length; ++i) {
                var picker = {
                    wrapper: pickers[i],
                    leftButton: pickers[i].querySelector(".picker-button.left"),
                    rightButton: pickers[i].querySelector(".picker-button.right"),
                    span: pickers[i].querySelector("span"),
                    inputs: pickers[i].querySelectorAll("input"),
                    observers: [],
                };
                bindPickerEvents(picker);
                dictionary[pickers[i].id] = picker;
            }
            return dictionary;
        }
        var pickersDictionary = buildPickersDictionary();
        function getIndexOfCheckedInput(picker) {
            for (var i = 0; i < picker.inputs.length; ++i) {
                if (picker.inputs[i].checked) {
                    return i;
                }
            }
            return -1;
        }
        function enableButton(button, enable) {
            if (enable) {
                button.classList.remove(DISABLED_BUTTON_CLASS);
            }
            else if (!button.classList.contains(DISABLED_BUTTON_CLASS)) {
                button.classList.add(DISABLED_BUTTON_CLASS);
            }
        }
        /**
         *  Updates selector text and disables/enables buttons if needed.
         */
        function updateVisibleValue(picker, callObservers) {
            var index = getIndexOfCheckedInput(picker);
            var selectedLabel;
            var selectedValue = null;
            if (index >= 0) {
                selectedLabel = picker.inputs[index].dataset.label;
                selectedValue = picker.inputs[index].value;
            }
            else {
                selectedLabel = picker.wrapper.dataset.placeholder || "";
            }
            picker.span.innerText = selectedLabel;
            if (picker.inputs.length < 0) {
                enableButton(picker.leftButton, false);
                enableButton(picker.rightButton, false);
            }
            else {
                enableButton(picker.leftButton, !picker.inputs[0].checked);
                enableButton(picker.rightButton, !picker.inputs[picker.inputs.length - 1].checked);
            }
            if (callObservers) {
                for (var _i = 0, _a = picker.observers; _i < _a.length; _i++) {
                    var observer = _a[_i];
                    observer(selectedValue);
                }
            }
        }
        function isButtonEnabled(button) {
            return !button.classList.contains(DISABLED_BUTTON_CLASS);
        }
        function bindPickerEvents(picker) {
            picker.leftButton.addEventListener("click", function () {
                if (isButtonEnabled(picker.leftButton)) {
                    var index = getIndexOfCheckedInput(picker);
                    if (index < 0) {
                        picker.inputs[picker.inputs.length - 1].checked = true;
                    }
                    else if (index > 0) {
                        picker.inputs[index].checked = false;
                        picker.inputs[index - 1].checked = true;
                    }
                    updateVisibleValue(picker, true);
                }
            });
            picker.rightButton.addEventListener("click", function () {
                if (isButtonEnabled(picker.rightButton)) {
                    var index = getIndexOfCheckedInput(picker);
                    if (index < 0) {
                        picker.inputs[0].checked = true;
                    }
                    else if (index < picker.inputs.length - 1) {
                        picker.inputs[index].checked = false;
                        picker.inputs[index + 1].checked = true;
                    }
                    updateVisibleValue(picker, true);
                }
            });
            updateVisibleValue(picker, true);
        }
        var Storage;
        (function (Storage) {
            var PREFIX = "picker";
            var NULL_VALUE = "__null__";
            function attachStorageEvents() {
                var pickersElementsSelectors = "div.inline-picker[id]";
                var pickersElements = document.querySelectorAll(pickersElementsSelectors);
                var _loop_1 = function (i) {
                    var pickerElement = pickersElements[i];
                    var pickerId = pickerElement.id;
                    addObserver(pickerId, function (selectedValue) {
                        var value = (selectedValue === null) ? NULL_VALUE : selectedValue;
                        Page.Helpers.URL.setQueryParameter(PREFIX, pickerId, value);
                    });
                };
                for (var i = 0; i < pickersElements.length; i++) {
                    _loop_1(i);
                }
            }
            Storage.attachStorageEvents = attachStorageEvents;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (controlId, value) {
                    if (pickersDictionary[controlId]) {
                        setValue(controlId, value);
                    }
                    else {
                        Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                    }
                });
            }
            Storage.applyStoredState = applyStoredState;
        })(Storage || (Storage = {}));
        Storage.applyStoredState();
        Storage.attachStorageEvents();
        function addObserver(id, observer) {
            pickersDictionary[id].observers.push(observer);
        }
        Picker.addObserver = addObserver;
        function getValue(id) {
            var picker = pickersDictionary[id];
            var index = getIndexOfCheckedInput(picker);
            if (index >= 0) {
                return picker.inputs[index].value;
            }
            return null;
        }
        Picker.getValue = getValue;
        function setValue(id, value) {
            var picker = pickersDictionary[id];
            for (var i = 0; i < picker.inputs.length; ++i) {
                picker.inputs[i].checked = (picker.inputs[i].value === value);
            }
            updateVisibleValue(picker, false);
        }
        Picker.setValue = setValue;
    })(Picker = Page.Picker || (Page.Picker = {}));
})(Page || (Page = {}));

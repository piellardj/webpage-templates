/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var Picker;
    (function (Picker_1) {
        var Picker = /** @class */ (function () {
            function Picker(container) {
                var _this = this;
                this.observers = [];
                this.id = container.id;
                this.container = container;
                this.leftButton = container.querySelector(".picker-button.left");
                this.rightButton = container.querySelector(".picker-button.right");
                this.spanElement = container.querySelector("span");
                this.radioInputs = [];
                var radioInputs = container.querySelectorAll("input");
                for (var i = 0; i < radioInputs.length; i++) {
                    this.radioInputs.push(radioInputs[i]);
                }
                this.leftButton.addEventListener("click", function () {
                    var index = _this.getIndexOfCheckedInput();
                    _this.checkOnlyRadio(index - 1, _this.radioInputs.length - 1);
                    _this.updateValue();
                    Storage.storeState(_this);
                    _this.callObservers();
                });
                this.rightButton.addEventListener("click", function () {
                    var index = _this.getIndexOfCheckedInput();
                    _this.checkOnlyRadio(index + 1, 0);
                    _this.updateValue();
                    Storage.storeState(_this);
                    _this.callObservers();
                });
                this.updateValue();
            }
            Object.defineProperty(Picker.prototype, "value", {
                get: function () {
                    return this._value;
                },
                set: function (newValue) {
                    for (var _i = 0, _a = this.radioInputs; _i < _a.length; _i++) {
                        var radioInput = _a[_i];
                        radioInput.checked = (radioInput.value === newValue);
                    }
                    this.updateValue();
                },
                enumerable: false,
                configurable: true
            });
            Picker.prototype.callObservers = function () {
                for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                    var observer = _a[_i];
                    observer(this.value);
                }
            };
            Picker.prototype.getIndexOfCheckedInput = function () {
                for (var i = 0; i < this.radioInputs.length; i++) {
                    if (this.radioInputs[i].checked) {
                        return i;
                    }
                }
                return -1;
            };
            Picker.prototype.updateValue = function () {
                var indexOfSelected = this.getIndexOfCheckedInput();
                if (indexOfSelected >= 0) {
                    this._value = this.radioInputs[indexOfSelected].value;
                }
                else {
                    this._value = null;
                }
                this.updateAppearance();
            };
            Picker.prototype.updateAppearance = function () {
                var index = this.getIndexOfCheckedInput();
                var selectedLabel;
                if (index >= 0) {
                    selectedLabel = this.radioInputs[index].dataset.label;
                }
                else {
                    selectedLabel = this.container.dataset.placeholder || "";
                }
                this.spanElement.innerText = selectedLabel;
                if (this.radioInputs.length < 0) {
                    this.enableButton(this.leftButton, false);
                    this.enableButton(this.rightButton, false);
                }
                else {
                    this.enableButton(this.leftButton, !this.radioInputs[0].checked);
                    this.enableButton(this.rightButton, !this.radioInputs[this.radioInputs.length - 1].checked);
                }
            };
            Picker.prototype.enableButton = function (button, enable) {
                button.disabled = !enable;
            };
            Picker.prototype.checkOnlyRadio = function (index, defaultIndex) {
                for (var _i = 0, _a = this.radioInputs; _i < _a.length; _i++) {
                    var radioInput = _a[_i];
                    radioInput.checked = false;
                }
                if (index >= 0 && index < this.radioInputs.length) {
                    this.radioInputs[index].checked = true;
                }
                else {
                    this.radioInputs[defaultIndex].checked = true;
                }
            };
            return Picker;
        }());
        var Cache;
        (function (Cache) {
            function loadCache() {
                var result = {};
                var containerElements = document.querySelectorAll("div.inline-picker[id]");
                for (var i = 0; i < containerElements.length; i++) {
                    var tabs = new Picker(containerElements[i]);
                    result[tabs.id] = tabs;
                }
                return result;
            }
            var pickersCache;
            function getPickerById(id) {
                Cache.load();
                return pickersCache[id] || null;
            }
            Cache.getPickerById = getPickerById;
            function load() {
                if (typeof pickersCache === "undefined") {
                    pickersCache = loadCache();
                }
            }
            Cache.load = load;
        })(Cache || (Cache = {}));
        var Storage;
        (function (Storage) {
            var PREFIX = "picker";
            var NULL_VALUE = "__null__";
            function storeState(picker) {
                var value = (picker.value === null) ? NULL_VALUE : picker.value;
                Page.Helpers.URL.setQueryParameter(PREFIX, picker.id, value);
            }
            Storage.storeState = storeState;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (controlId, value) {
                    var picker = Cache.getPickerById(controlId);
                    if (!picker) {
                        Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                    }
                    else {
                        picker.value = value;
                        picker.callObservers();
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
            var picker = Cache.getPickerById(id);
            picker.observers.push(observer);
        }
        Picker_1.addObserver = addObserver;
        function getValue(id) {
            var picker = Cache.getPickerById(id);
            return picker.value;
        }
        Picker_1.getValue = getValue;
        function setValue(id, value) {
            var picker = Cache.getPickerById(id);
            picker.value = value;
        }
        Picker_1.setValue = setValue;
    })(Picker = Page.Picker || (Page.Picker = {}));
})(Page || (Page = {}));

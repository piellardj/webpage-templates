/// <reference path="../helpers.ts"/>
var Page;
(function (Page) {
    var Picker;
    (function (Picker_1) {
        var Picker = /** @class */ (function () {
            function Picker(container) {
                var _this = this;
                this.observers = [];
                this._value = null;
                this.id = container.id;
                this.container = container;
                this.leftButton = Page.Helpers.Utils.selector(container, ".picker-button.left");
                this.rightButton = Page.Helpers.Utils.selector(container, ".picker-button.right");
                this.spanElement = Page.Helpers.Utils.selector(container, "span");
                this.radioInputs = Page.Helpers.Utils.selectorAll(container, "input");
                this.leftButton.addEventListener("click", function () {
                    var index = _this.getIndexOfCheckedInput();
                    _this.checkOnlyRadio(index - 1, _this.radioInputs.length - 1);
                    _this.updateValue();
                    pickersStorage.storeState(_this);
                    _this.callObservers();
                });
                this.rightButton.addEventListener("click", function () {
                    var index = _this.getIndexOfCheckedInput();
                    _this.checkOnlyRadio(index + 1, 0);
                    _this.updateValue();
                    pickersStorage.storeState(_this);
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
                return Page.Helpers.Utils.findFirst(this.radioInputs, function (radio) { return radio.checked; });
            };
            Picker.prototype.updateValue = function () {
                var indexOfSelected = this.getIndexOfCheckedInput();
                var checkedInput = this.radioInputs[indexOfSelected];
                if (checkedInput) {
                    this._value = checkedInput.value;
                }
                else {
                    this._value = null;
                }
                this.updateAppearance();
            };
            Picker.prototype.updateAppearance = function () {
                var index = this.getIndexOfCheckedInput();
                var checkedInput = this.radioInputs[index];
                var selectedLabel;
                if (checkedInput) {
                    selectedLabel = checkedInput.dataset["label"] || "<no label>";
                }
                else {
                    selectedLabel = this.container.dataset["placeholder"] || "";
                }
                this.spanElement.innerText = selectedLabel;
                var firstRadio = this.radioInputs[0];
                var lastRadio = this.radioInputs[this.radioInputs.length - 1];
                if (firstRadio && lastRadio) {
                    this.enableButton(this.leftButton, !firstRadio.checked);
                    this.enableButton(this.rightButton, !lastRadio.checked);
                }
                else {
                    this.enableButton(this.leftButton, false);
                    this.enableButton(this.rightButton, false);
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
                var inputToCheck;
                if (index >= 0 && index < this.radioInputs.length) {
                    inputToCheck = this.radioInputs[index];
                }
                else if (defaultIndex >= 0 && defaultIndex < this.radioInputs.length) {
                    inputToCheck = this.radioInputs[defaultIndex];
                }
                if (!inputToCheck) {
                    throw new Error("No input to check: index=".concat(index, " and defaultIndex=").concat(defaultIndex, "."));
                }
                inputToCheck.checked = true;
            };
            return Picker;
        }());
        var pickersCache = new Page.Helpers.Cache("Picker", function () {
            var containerElements = Page.Helpers.Utils.selectorAll(document, "div.inline-picker[id]");
            return containerElements.map(function (containerElement) {
                return new Picker(containerElement);
            });
        });
        var pickersStorage = new Page.Helpers.Storage("picker", function (picker) {
            return (picker.value === null) ? "__null__" : picker.value;
        }, function (id, serializedValue) {
            var picker = pickersCache.getByIdSafe(id);
            if (picker) {
                picker.value = serializedValue;
                picker.callObservers();
                return true;
            }
            return false;
        });
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            pickersCache.load();
            pickersStorage.applyStoredState();
        });
        function addObserver(id, observer) {
            var picker = pickersCache.getById(id);
            picker.observers.push(observer);
        }
        Picker_1.addObserver = addObserver;
        function getValue(id) {
            var picker = pickersCache.getById(id);
            return picker.value;
        }
        Picker_1.getValue = getValue;
        function setValue(id, value) {
            var picker = pickersCache.getById(id);
            picker.value = value;
        }
        Picker_1.setValue = setValue;
        function storeState(id) {
            var picker = pickersCache.getById(id);
            pickersStorage.storeState(picker);
        }
        Picker_1.storeState = storeState;
        function clearStoredState(id) {
            var picker = pickersCache.getById(id);
            pickersStorage.clearStoredState(picker);
        }
        Picker_1.clearStoredState = clearStoredState;
    })(Picker = Page.Picker || (Page.Picker = {}));
})(Page || (Page = {}));

/// <reference path="../helpers.ts"/>
var Page;
(function (Page) {
    var ColorPicker;
    (function (ColorPicker_1) {
        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }
        function roundAndClamp(value, min, max) {
            var rounded = Math.round(value);
            return clamp(rounded, min, max);
        }
        function positiveModulus(a, b) {
            return ((a % b) + b) % b;
        }
        var ColorSpace;
        (function (ColorSpace) {
            function parseHexa(value) {
                if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                    return value.toUpperCase();
                }
                return null;
            }
            ColorSpace.parseHexa = parseHexa;
            function hsvToRgb(hsv) {
                var h2 = hsv.h / 60;
                var c = hsv.s * hsv.v;
                var x = c * (1 - Math.abs(positiveModulus(h2, 2) - 1));
                var rgb;
                if (h2 <= 1) {
                    rgb = { r: c, g: x, b: 0 };
                }
                else if (h2 <= 2) {
                    rgb = { r: x, g: c, b: 0 };
                }
                else if (h2 <= 3) {
                    rgb = { r: 0, g: c, b: x };
                }
                else if (h2 <= 4) {
                    rgb = { r: 0, g: x, b: c };
                }
                else if (h2 <= 5) {
                    rgb = { r: x, g: 0, b: c };
                }
                else {
                    rgb = { r: c, g: 0, b: x };
                }
                var m = hsv.v - c;
                rgb.r = roundAndClamp((rgb.r + m) * 255, 0, 255);
                rgb.g = roundAndClamp((rgb.g + m) * 255, 0, 255);
                rgb.b = roundAndClamp((rgb.b + m) * 255, 0, 255);
                return rgb;
            }
            ColorSpace.hsvToRgb = hsvToRgb;
            function rgbToHsv(rgb) {
                var nr = rgb.r / 255;
                var ng = rgb.g / 255;
                var nb = rgb.b / 255;
                var cmax = Math.max(nr, ng, nb);
                var cmin = Math.min(nr, ng, nb);
                var delta = cmax - cmin;
                var result = { h: 0, s: 0, v: cmax };
                if (delta !== 0) {
                    if (cmax === nr) {
                        result.h = 60 * (((ng - nb) / delta) % 6);
                    }
                    else if (cmax === ng) {
                        result.h = 60 * (((nb - nr) / delta) + 2);
                    }
                    else if (cmax === nb) {
                        result.h = 60 * (((nr - ng) / delta) + 4);
                    }
                }
                if (cmax !== 0) {
                    result.s = delta / cmax;
                }
                result.h = positiveModulus(result.h, 360);
                return result;
            }
            ColorSpace.rgbToHsv = rgbToHsv;
            function rgbToHex(rgb) {
                return "#" + charToHex(rgb.r) + charToHex(rgb.g) + charToHex(rgb.b);
            }
            ColorSpace.rgbToHex = rgbToHex;
            function hexToRgb(hex) {
                return {
                    r: parseInt(hex.substring(1, 3), 16),
                    g: parseInt(hex.substring(3, 5), 16),
                    b: parseInt(hex.substring(5, 7), 16),
                };
            }
            ColorSpace.hexToRgb = hexToRgb;
            function charToHex(value) {
                var hex = value.toString(16).toUpperCase();
                return hex.length === 2 ? hex : "0" + hex;
            }
        })(ColorSpace || (ColorSpace = {}));
        var ColorPicker = /** @class */ (function () {
            function ColorPicker(element) {
                var _this = this;
                this.observers = [];
                this.element = element;
                this.id = element.id;
                this.colorPreview = element.querySelector(".color-preview");
                this.colorPreviewText = element.querySelector(".color-value");
                this.updateVisiblePart();
                this.element.addEventListener("click", function () {
                    Popup.assignPopup(_this);
                });
            }
            Object.defineProperty(ColorPicker.prototype, "value", {
                get: function () {
                    var fromDataset = this.element.dataset["currentColor"];
                    if (!fromDataset) {
                        throw new Error("No current color on ColorPicker '".concat(this.id, "'."));
                    }
                    return fromDataset;
                },
                set: function (newValue) {
                    var previousValue = this.value;
                    if (previousValue !== newValue) {
                        this.element.dataset["currentColor"] = newValue;
                        this.updateVisiblePart();
                        var rgb = ColorSpace.hexToRgb(newValue);
                        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                            var observer = _a[_i];
                            observer(rgb);
                        }
                    }
                },
                enumerable: false,
                configurable: true
            });
            ColorPicker.prototype.updateVisiblePart = function () {
                var hexValue = this.value;
                this.colorPreview.style.background = hexValue;
                this.colorPreviewText.textContent = hexValue;
            };
            return ColorPicker;
        }());
        var colorPickersCache = new Page.Helpers.Cache("ColorPicker", function () {
            var containers = Page.Helpers.Utils.selectorAll(document, ".color-picker[id]");
            return containers.map(function (container) {
                return new ColorPicker(container);
            });
        });
        var colorPickersStorage = new Page.Helpers.Storage("color-picker", function (colorPicker) {
            return colorPicker.value;
        }, function (id, serializedValue) {
            var colorPicker = colorPickersCache.getByIdSafe(id);
            var hexValue = ColorSpace.parseHexa(serializedValue);
            if (colorPicker && hexValue) {
                colorPicker.value = hexValue;
                return true;
            }
            return false;
        });
        var Popup = /** @class */ (function () {
            function Popup() {
                var _this = this;
                this.hsv = { h: 200, s: 0.75, v: 0.5 };
                this.popupElement = Popup.buildElement("div", ["popup", "color-picker-popup"]);
                {
                    this.valueSaturationPicker = Popup.buildElement("div", ["block", "picker", "value-saturation-picker"]);
                    this.hueColorFilter = Popup.buildElement("span", ["color-filter", "outlined"]);
                    this.valueSaturationPicker.appendChild(this.hueColorFilter);
                    var valueColorFilter = Popup.buildElement("span", ["color-filter", "outlined"]);
                    valueColorFilter.style.background = "linear-gradient(to top, black, rgba(0,0,0,0))";
                    this.valueSaturationPicker.appendChild(valueColorFilter);
                    this.valueSaturationCursor = Popup.buildElement("span", ["cursor"]);
                    this.valueSaturationPicker.appendChild(this.valueSaturationCursor);
                    this.popupElement.appendChild(this.valueSaturationPicker);
                }
                {
                    this.huePicker = Popup.buildElement("div", ["block", "picker", "hue-picker"]);
                    var hueBar = Popup.buildElement("span", ["hue-bar"]);
                    this.huePicker.appendChild(hueBar);
                    this.hueCursor = Popup.buildElement("span", ["cursor"]);
                    this.huePicker.appendChild(this.hueCursor);
                    this.popupElement.appendChild(this.huePicker);
                }
                {
                    var previewBlock = Popup.buildElement("div", ["preview-block"]);
                    this.previewColor = Popup.buildElement("div", ["preview-color", "outlined"]);
                    this.previewColor.classList.add("block");
                    previewBlock.appendChild(this.previewColor);
                    {
                        var previewText = Popup.buildElement("table", ["block"]);
                        var hexaContainer = Popup.buildPreviewText(previewText, "hexa");
                        var hash = Popup.buildElement("span");
                        hash.textContent = "#";
                        hexaContainer.appendChild(hash);
                        this.previewHexaValue = document.createElement("input");
                        this.previewHexaValue.type = "text";
                        this.previewHexaValue.minLength = 6;
                        this.previewHexaValue.maxLength = 6;
                        this.previewHexaValue.size = 6;
                        this.previewHexaValue.pattern = "[0-9a-fA-F]{6}";
                        this.previewHexaValue.addEventListener("input", function () {
                            var newValue = "#" + _this.previewHexaValue.value;
                            var newHexa = ColorSpace.parseHexa(newValue);
                            if (newHexa) { // valid input
                                var newRgb = ColorSpace.hexToRgb(newValue);
                                var newHsl = ColorSpace.rgbToHsv(newRgb);
                                _this.hsv.h = newHsl.h;
                                _this.hsv.s = newHsl.s;
                                _this.hsv.v = newHsl.v;
                                _this.onInput();
                            }
                        });
                        hexaContainer.appendChild(this.previewHexaValue);
                        this.previewRgbValue = Popup.buildPreviewText(previewText, "rgb");
                        this.previewHslValue = Popup.buildPreviewText(previewText, "hsv");
                        previewBlock.appendChild(previewText);
                    }
                    this.popupElement.appendChild(previewBlock);
                }
                this.registerCursorEvent(this.huePicker, function (coords) {
                    _this.hsv.h = roundAndClamp(360 * coords.x, 0, 360);
                    _this.onInput();
                });
                this.registerCursorEvent(this.valueSaturationPicker, function (coords) {
                    _this.hsv.s = clamp(coords.x, 0, 1);
                    _this.hsv.v = clamp(1 - coords.y, 0, 1);
                    _this.onInput();
                    // retain exact position because rebuilding it from color is not exact
                    _this.valueSaturationCursor.style.left = Popup.percentageString(coords.x);
                    _this.valueSaturationCursor.style.top = Popup.percentageString(coords.y);
                });
                var isActive = false;
                this.popupElement.addEventListener("mousedown", function setActive() {
                    isActive = true;
                });
                window.addEventListener("mouseup", function (event) {
                    var clickedOutOfPopup = !_this.popupElement.contains(event.target);
                    if (clickedOutOfPopup && _this.popupElement.parentElement && !isActive) {
                        _this.popupElement.parentElement.removeChild(_this.popupElement);
                    }
                    isActive = false;
                });
                window.addEventListener("resize", function () {
                    _this.fitPopupToContainer();
                });
                window.addEventListener("scroll", function () {
                    _this.fitPopupToContainer();
                });
            }
            Popup.assignPopup = function (colorPicker) {
                if (!Popup.popup) {
                    Popup.popup = new Popup();
                }
                Popup.popup.attach(colorPicker);
            };
            Popup.prototype.updateAppearance = function () {
                var rgb = ColorSpace.hsvToRgb(this.hsv);
                var hexString = ColorSpace.rgbToHex(rgb);
                var rgbString = "rgb(".concat(rgb.r, ", ").concat(rgb.g, ", ").concat(rgb.b, ")"); // real coor
                var hslString = "hsl(".concat(Math.round(this.hsv.h), ", 100%, 50%)"); // pure color
                // colors
                this.hueColorFilter.style.background = "linear-gradient(to right, white, ".concat(hslString, ")");
                this.hueCursor.style.background = hslString;
                this.valueSaturationCursor.style.background = rgbString;
                this.previewColor.style.background = rgbString;
                // text
                this.previewHexaValue.value = hexString.substring(1);
                this.previewRgbValue.textContent = "".concat(rgb.r, ", ").concat(rgb.g, ", ").concat(rgb.b);
                var percentSaturation = Popup.percentageString(this.hsv.s);
                var percentValue = Popup.percentageString(this.hsv.v);
                this.previewHslValue.textContent = "".concat(Math.round(this.hsv.h), "\u00B0, ").concat(percentSaturation, ", ").concat(percentValue);
                // cursors positions
                this.hueCursor.style.left = Popup.percentageString(this.hsv.h / 360);
                this.valueSaturationCursor.style.left = percentSaturation;
                this.valueSaturationCursor.style.top = Popup.percentageString(1 - this.hsv.v);
            };
            Popup.prototype.onInput = function () {
                var rgb = ColorSpace.hsvToRgb(this.hsv);
                var hexString = ColorSpace.rgbToHex(rgb);
                this.updateAppearance();
                if (this.currentControl) {
                    this.currentControl.value = hexString;
                }
                colorPickersStorage.storeState(this.currentControl);
            };
            Popup.prototype.attach = function (colorPicker) {
                this.currentControl = colorPicker;
                var currentHex = colorPicker.value;
                var currentRgb = ColorSpace.hexToRgb(currentHex);
                var currentHsv = ColorSpace.rgbToHsv(currentRgb);
                Popup.popup.hsv.h = currentHsv.h;
                Popup.popup.hsv.v = currentHsv.v;
                Popup.popup.hsv.s = currentHsv.s;
                Popup.popup.updateAppearance();
                // reset placement to avoid flickering due to the popup being temporarily out of screen
                this.popupElement.style.top = "";
                this.popupElement.style.left = "";
                document.body.appendChild(this.popupElement);
                this.fitPopupToContainer();
            };
            Popup.prototype.fitPopupToContainer = function () {
                if (this.popupElement.parentElement && this.currentControl) {
                    var currentControlBox = this.currentControl.colorPreview.getBoundingClientRect();
                    var popupElementBox = this.popupElement.getBoundingClientRect();
                    var idealLeft = currentControlBox.left + window.scrollX;
                    var idealTop = currentControlBox.top + window.scrollY;
                    var left = idealLeft;
                    var top_1 = idealTop;
                    var minMargin = 8; // pixels
                    var plannedRight = idealLeft + popupElementBox.width;
                    var rightShiftNeeded = plannedRight - (document.body.clientWidth - minMargin);
                    if (rightShiftNeeded > 0) {
                        left -= rightShiftNeeded;
                    }
                    var plannedBottom = idealTop + popupElementBox.height;
                    var bottomShiftNeeded = plannedBottom - (window.scrollY + window.innerHeight - minMargin);
                    if (bottomShiftNeeded > 0) {
                        top_1 -= bottomShiftNeeded;
                    }
                    top_1 = Math.max(window.scrollY + minMargin, top_1);
                    this.popupElement.style.left = left + "px";
                    this.popupElement.style.top = top_1 + "px";
                }
            };
            Popup.prototype.registerCursorEvent = function (container, callback) {
                function absoluteToRelative(clientX, clientY) {
                    var containerBox = container.getBoundingClientRect();
                    var relativeX = (clientX - containerBox.left) / containerBox.width;
                    var relativeY = (clientY - containerBox.top) / containerBox.height;
                    return {
                        x: Math.max(0, Math.min(1, relativeX)),
                        y: Math.max(0, Math.min(1, relativeY)),
                    };
                }
                var cursor = container.querySelector(".cursor");
                var handleOffset = { x: 0, y: 0 };
                var isBeingDragged = false;
                container.addEventListener("mousedown", function onMouseDown(event) {
                    isBeingDragged = true;
                    handleOffset.x = 0;
                    handleOffset.y = 0;
                    if (cursor && event.target === cursor) {
                        var cursorBox = cursor.getBoundingClientRect();
                        handleOffset.x = 0.5 * cursorBox.width - (event.clientX - cursorBox.left);
                        handleOffset.y = 0.5 * cursorBox.height - (event.clientY - cursorBox.top);
                    }
                    else {
                        var coords = absoluteToRelative(event.clientX, event.clientY);
                        callback(coords);
                    }
                });
                window.addEventListener("mouseup", function onMouseUp() {
                    isBeingDragged = false;
                });
                window.addEventListener("mousemove", function onMouseMove(event) {
                    if (isBeingDragged) {
                        var coords = absoluteToRelative(event.clientX + handleOffset.x, event.clientY + handleOffset.y);
                        callback(coords);
                    }
                });
                var currentTouchIds = [];
                container.addEventListener("touchstart", function onTouchStart(event) {
                    isBeingDragged = true;
                    var isFirstTouch = (currentTouchIds.length === 0);
                    var changedTouches = Page.Helpers.Utils.touchArray(event.changedTouches);
                    for (var _i = 0, changedTouches_1 = changedTouches; _i < changedTouches_1.length; _i++) {
                        var touch = changedTouches_1[_i];
                        var alreadyRegistered = false;
                        for (var _a = 0, currentTouchIds_1 = currentTouchIds; _a < currentTouchIds_1.length; _a++) {
                            var knownTouchId = currentTouchIds_1[_a];
                            if (touch.identifier === knownTouchId) {
                                alreadyRegistered = true;
                                break;
                            }
                        }
                        if (!alreadyRegistered) {
                            currentTouchIds.push(touch.identifier);
                        }
                    }
                    if (isFirstTouch && currentTouchIds.length > 0) {
                        var changedTouch = changedTouches[0];
                        if (!changedTouch) {
                            console.error("Should not happen: ColorPicker missed first touch.");
                        }
                        else {
                            var coords = absoluteToRelative(changedTouch.clientX, changedTouch.clientY);
                            callback(coords);
                        }
                    }
                }, false);
                window.addEventListener("touchend", function onTouchEnd(event) {
                    var knewAtLeastOneTouch = (currentTouchIds.length > 0);
                    var changedTouches = Page.Helpers.Utils.touchArray(event.changedTouches);
                    for (var _i = 0, changedTouches_2 = changedTouches; _i < changedTouches_2.length; _i++) {
                        var touch = changedTouches_2[_i];
                        for (var iC = 0; iC < currentTouchIds.length; ++iC) {
                            if (touch.identifier === currentTouchIds[iC]) {
                                currentTouchIds.splice(iC, 1);
                                iC--;
                            }
                        }
                    }
                    if (knewAtLeastOneTouch && currentTouchIds.length === 0) {
                        isBeingDragged = false;
                    }
                });
                window.addEventListener("touchmove", function onTouchMove(event) {
                    if (currentTouchIds.length > 0 && isBeingDragged) {
                        var touches = Page.Helpers.Utils.touchArray(event.changedTouches);
                        for (var _i = 0, touches_1 = touches; _i < touches_1.length; _i++) {
                            var touch = touches_1[_i];
                            for (var _a = 0, currentTouchIds_2 = currentTouchIds; _a < currentTouchIds_2.length; _a++) {
                                var knownTouch = currentTouchIds_2[_a];
                                if (touch.identifier === knownTouch) {
                                    var coords = absoluteToRelative(touch.clientX, touch.clientY);
                                    callback(coords);
                                    event.preventDefault();
                                    return;
                                }
                            }
                        }
                    }
                }, { passive: false });
            };
            Popup.buildElement = function (tagname, classList) {
                var element = document.createElement(tagname);
                if (classList) {
                    element.className = classList.join(" ");
                }
                return element;
            };
            Popup.buildPreviewText = function (container, name) {
                var row = document.createElement("tr");
                var nameSpan = document.createElement("td");
                nameSpan.textContent = name + ":";
                var valueSpan = document.createElement("td");
                row.appendChild(nameSpan);
                row.appendChild(valueSpan);
                container.appendChild(row);
                return valueSpan;
            };
            Popup.percentageString = function (value) {
                return Math.round(100 * value) + "%";
            };
            return Popup;
        }());
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            colorPickersCache.load();
            colorPickersStorage.applyStoredState();
        });
        function addObserver(id, observer) {
            var colorPicker = colorPickersCache.getById(id);
            colorPicker.observers.push(observer);
        }
        ColorPicker_1.addObserver = addObserver;
        function getValue(id) {
            var colorPicker = colorPickersCache.getById(id);
            var hexValue = colorPicker.value;
            return ColorSpace.hexToRgb(hexValue);
        }
        ColorPicker_1.getValue = getValue;
        function getValueHex(id) {
            var colorPicker = colorPickersCache.getById(id);
            return colorPicker.value;
        }
        ColorPicker_1.getValueHex = getValueHex;
        /**
         * @param id control id
         * @param r integer in [0, 255]
         * @param g integer in [0, 255]
         * @param b integer in [0, 255]
         */
        function setValue(id, r, g, b) {
            var rgb = {
                r: roundAndClamp(r, 0, 255),
                g: roundAndClamp(g, 0, 255),
                b: roundAndClamp(b, 0, 255),
            };
            var hexValue = ColorSpace.rgbToHex(rgb);
            var colorPicker = colorPickersCache.getById(id);
            colorPicker.value = hexValue;
        }
        ColorPicker_1.setValue = setValue;
        function storeState(id) {
            var colorPicker = colorPickersCache.getById(id);
            colorPickersStorage.storeState(colorPicker);
        }
        ColorPicker_1.storeState = storeState;
        function clearStoredState(id) {
            var colorPicker = colorPickersCache.getById(id);
            colorPickersStorage.clearStoredState(colorPicker);
        }
        ColorPicker_1.clearStoredState = clearStoredState;
    })(ColorPicker = Page.ColorPicker || (Page.ColorPicker = {}));
})(Page || (Page = {}));

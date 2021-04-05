/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            ColorPicker.getColorPicker = function (id) {
                if (!ColorPicker.colorPickersMap[id]) {
                    var element = document.querySelector("#" + id + ".color-picker");
                    if (element) {
                        ColorPicker.colorPickersMap[id] = new ColorPicker(element);
                    }
                }
                return ColorPicker.colorPickersMap[id];
            };
            Object.defineProperty(ColorPicker.prototype, "value", {
                get: function () {
                    return this.element.dataset.currentColor;
                },
                set: function (newValue) {
                    var previousValue = this.value;
                    if (previousValue !== newValue) {
                        this.element.dataset.currentColor = newValue;
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
            ColorPicker.prototype.attachPopup = function (popup) {
                this.element.parentElement.appendChild(popup);
            };
            ColorPicker.prototype.updateVisiblePart = function () {
                var hexValue = this.value;
                this.colorPreview.style.background = hexValue;
                this.colorPreviewText.textContent = hexValue;
            };
            ColorPicker.colorPickersMap = {};
            return ColorPicker;
        }());
        var Storage;
        (function (Storage) {
            var PREFIX = "color-picker";
            function storeState(colorPicker) {
                Page.Helpers.URL.setQueryParameter(PREFIX, colorPicker.id, colorPicker.value);
            }
            Storage.storeState = storeState;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (controlId, value) {
                    var hexValue = ColorSpace.parseHexa(value);
                    if (hexValue) {
                        var colorPicker = ColorPicker.getColorPicker(controlId);
                        if (colorPicker) {
                            colorPicker.value = hexValue;
                        }
                    }
                });
            }
            Storage.applyStoredState = applyStoredState;
        })(Storage || (Storage = {}));
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
                var rgbString = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")"; // real coor
                var hslString = "hsl(" + Math.round(this.hsv.h) + ", 100%, 50%)"; // pure color
                // colors
                this.hueColorFilter.style.background = "linear-gradient(to right, white, " + hslString + ")";
                this.hueCursor.style.background = hslString;
                this.valueSaturationCursor.style.background = rgbString;
                this.previewColor.style.background = rgbString;
                // text
                this.previewHexaValue.value = hexString.substring(1);
                this.previewRgbValue.textContent = rgb.r + ", " + rgb.g + ", " + rgb.b;
                var percentSaturation = Popup.percentageString(this.hsv.s);
                var percentValue = Popup.percentageString(this.hsv.v);
                this.previewHslValue.textContent = Math.round(this.hsv.h) + "\u00B0, " + percentSaturation + ", " + percentValue;
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
                Storage.storeState(this.currentControl);
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
                this.currentControl.attachPopup(this.popupElement);
                this.fitPopupToContainer();
            };
            Popup.prototype.fitPopupToContainer = function () {
                if (this.popupElement.parentElement) {
                    var container = document.querySelector(".controls-block") || document.body;
                    var containerBox = container.getBoundingClientRect();
                    var margin = 16;
                    var containerRight = containerBox.left + containerBox.width - margin;
                    var containerBottom = containerBox.top + containerBox.height - margin;
                    this.popupElement.style.maxWidth = (containerBox.width - 2 * margin) + "px";
                    this.popupElement.style.maxHeight = (containerBox.height - 2 * margin) + "px";
                    var parentBox = this.popupElement.parentElement.getBoundingClientRect();
                    var popupBox = this.popupElement.getBoundingClientRect();
                    var leftOffset = Math.max(0, (containerBox.left + margin) - parentBox.left);
                    var rightOffset = Math.min(0, containerRight - (parentBox.left + popupBox.width));
                    var topOffset = Math.max(0, (containerBox.top + margin) - parentBox.top);
                    var bottomOffset = Math.min(0, containerBottom - (parentBox.top + popupBox.height));
                    this.popupElement.style.left = (leftOffset + rightOffset) + "px";
                    this.popupElement.style.top = (topOffset + bottomOffset) + "px";
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
                        console.log(JSON.stringify(handleOffset));
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
                    for (var i = 0; i < event.changedTouches.length; ++i) {
                        var touch = event.changedTouches[i];
                        var alreadyRegistered = false;
                        for (var _i = 0, currentTouchIds_1 = currentTouchIds; _i < currentTouchIds_1.length; _i++) {
                            var knownTouchId = currentTouchIds_1[_i];
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
                        var coords = absoluteToRelative(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                        callback(coords);
                    }
                }, false);
                window.addEventListener("touchend", function onTouchEnd(event) {
                    var knewAtLeastOneTouch = (currentTouchIds.length > 0);
                    for (var i = 0; i < event.changedTouches.length; ++i) {
                        var touch = event.changedTouches[i];
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
                        var touches = event.changedTouches;
                        for (var i = 0; i < touches.length; ++i) {
                            var touch = touches[i];
                            for (var _i = 0, currentTouchIds_2 = currentTouchIds; _i < currentTouchIds_2.length; _i++) {
                                var knownTouch = currentTouchIds_2[_i];
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
        window.addEventListener("load", function buildColorPickersMap() {
            var list = document.querySelectorAll(".color-picker");
            for (var i = 0; i < list.length; i++) {
                var colorPickerElement = list[i];
                var id = colorPickerElement.id;
                ColorPicker.getColorPicker(id); // register the color picker
            }
            Storage.applyStoredState();
        });
        function addObserver(id, observer) {
            var colorPicker = ColorPicker.getColorPicker(id);
            if (colorPicker) {
                colorPicker.observers.push(observer);
            }
            return false;
        }
        ColorPicker_1.addObserver = addObserver;
        function getValue(id) {
            var colorPicker = ColorPicker.getColorPicker(id);
            var hexValue = colorPicker.value;
            return ColorSpace.hexToRgb(hexValue);
        }
        ColorPicker_1.getValue = getValue;
        function getValueHex(id) {
            var colorPicker = ColorPicker.getColorPicker(id);
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
            var colorPicker = ColorPicker.getColorPicker(id);
            colorPicker.value = hexValue;
        }
        ColorPicker_1.setValue = setValue;
    })(ColorPicker = Page.ColorPicker || (Page.ColorPicker = {}));
})(Page || (Page = {}));

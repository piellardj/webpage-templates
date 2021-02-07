/// <reference path="../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var ColorPicker;
    (function (ColorPicker_1) {
        function clamp(value, min, max) {
            return Math.max(min, Math.max(min, value));
        }
        function roundAndClamp(value, min, max) {
            var rounded = Math.round(value);
            return clamp(rounded, min, max);
        }
        var ColorSpace;
        (function (ColorSpace) {
            function hsvToRgb(hsv) {
                var h2 = hsv.h / 60;
                var c = hsv.s * hsv.v;
                var x = c * (1 - Math.abs(h2 % 2 - 1));
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
                result.h = roundAndClamp(result.h, 0, 360);
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
                this.observers = [];
                this.element = element;
                this.colorPreview = element.querySelector(".color-preview");
                this.colorPreviewText = element.querySelector(".color-value");
                this.updateVisiblePart();
            }
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
            return ColorPicker;
        }());
        var Popup;
        (function (Popup) {
            var ID = "color-picker-popup";
            var currentControl;
            var popupElement = null;
            var valueSaturationPicker = null;
            var hueColorFilter = null;
            var valueSaturationCursor = null;
            var huePicker = null;
            var hueCursor = null;
            var previewColor = null;
            var previewHexaValue = null;
            var previewRgbValue = null;
            var previewHslValue = null;
            var hsv = { h: 200, s: 0.75, v: 0.5 };
            function buildPopup() {
                function buildElement(tagname, classList) {
                    var element = document.createElement(tagname);
                    if (classList) {
                        element.className = classList.join(" ");
                    }
                    return element;
                }
                popupElement = buildElement("div", ["popup", "color-picker-popup"]);
                {
                    valueSaturationPicker = buildElement("div", ["block", "picker", "value-saturation-picker"]);
                    hueColorFilter = buildElement("span", ["color-filter", "outlined"]);
                    valueSaturationPicker.appendChild(hueColorFilter);
                    var valueColorFilter = buildElement("span", ["color-filter", "outlined"]);
                    valueColorFilter.style.background = "linear-gradient(to top, black, rgba(0,0,0,0))";
                    valueSaturationPicker.appendChild(valueColorFilter);
                    valueSaturationCursor = buildElement("span", ["cursor"]);
                    valueSaturationPicker.appendChild(valueSaturationCursor);
                    popupElement.appendChild(valueSaturationPicker);
                }
                {
                    huePicker = buildElement("div", ["block", "picker", "hue-picker"]);
                    var hueBar = buildElement("span", ["hue-bar"]);
                    huePicker.appendChild(hueBar);
                    hueCursor = buildElement("span", ["cursor"]);
                    huePicker.appendChild(hueCursor);
                    popupElement.appendChild(huePicker);
                }
                {
                    var previewBlock = buildElement("div", ["preview-block"]);
                    previewColor = buildElement("div", ["preview-color", "outlined"]);
                    previewColor.classList.add("block");
                    previewBlock.appendChild(previewColor);
                    {
                        var previewText_1 = document.createElement("div");
                        previewText_1.classList.add("block");
                        function buildPreviewText(name) {
                            var container = document.createElement("div");
                            var nameSpan = document.createElement("span");
                            nameSpan.textContent = name + ":";
                            nameSpan.classList.add("preview-text-label");
                            var valueSpan = document.createElement("span");
                            container.appendChild(nameSpan);
                            container.appendChild(valueSpan);
                            previewText_1.appendChild(container);
                            return valueSpan;
                        }
                        previewHexaValue = buildPreviewText("hex");
                        previewRgbValue = buildPreviewText("rgb");
                        previewHslValue = buildPreviewText("hsv");
                        previewBlock.appendChild(previewText_1);
                    }
                    popupElement.appendChild(previewBlock);
                }
                registerCursorEvent(huePicker, function (coords) {
                    hsv.h = roundAndClamp(360 * coords.x, 0, 360);
                    onColorChange();
                });
                registerCursorEvent(valueSaturationPicker, function (coords) {
                    hsv.s = clamp(coords.x, 0, 1);
                    hsv.v = clamp(1 - coords.y, 0, 1);
                    onColorChange();
                    // retain exact position because rebuilding it from color is not exact
                    valueSaturationCursor.style.left = percentageString(coords.x);
                    valueSaturationCursor.style.top = percentageString(coords.y);
                });
                var isActive = false;
                popupElement.addEventListener("mousedown", function setActive() {
                    isActive = true;
                });
                window.addEventListener("mouseup", function checkIfPopupShouldBeDetached(event) {
                    var clickedOutOfPopup = !popupElement.contains(event.target);
                    if (clickedOutOfPopup && popupElement.parentElement && !isActive) {
                        popupElement.parentElement.removeChild(popupElement);
                    }
                    isActive = false;
                });
            }
            function registerCursorEvent(container, callback) {
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
            }
            function percentageString(value) {
                return Math.round(100 * value) + "%";
            }
            function onColorChange() {
                var rgb = ColorSpace.hsvToRgb(hsv);
                var hexString = ColorSpace.rgbToHex(rgb);
                var rgbString = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")"; // real coor
                var hslString = "hsl(" + hsv.h + ", 100%, 50%)"; // pure color
                // colors
                hueColorFilter.style.background = "linear-gradient(to right, white, " + hslString + ")";
                hueCursor.style.background = hslString;
                valueSaturationCursor.style.background = rgbString;
                previewColor.style.background = rgbString;
                // text
                previewHexaValue.textContent = hexString;
                previewRgbValue.textContent = rgb.r + ", " + rgb.g + ", " + rgb.b;
                previewHslValue.textContent = hsv.h + "\u00B0, " + percentageString(hsv.s) + ", " + percentageString(hsv.v);
                // cursors positions
                hueCursor.style.left = percentageString(hsv.h / 360);
                valueSaturationCursor.style.left = percentageString(hsv.s);
                valueSaturationCursor.style.top = percentageString(1 - hsv.v);
                if (currentControl) {
                    currentControl.value = hexString;
                }
            }
            function fitPopupToContainer() {
                if (popupElement && popupElement.parentElement) {
                    var container = document.querySelector(".controls-block") || document.body;
                    var containerBox = container.getBoundingClientRect();
                    var margin = 16;
                    popupElement.style.maxWidth = (containerBox.width - 2 * margin) + "px";
                    popupElement.style.maxHeight = (containerBox.height - 2 * margin) + "px";
                    var parentBox = popupElement.parentElement.getBoundingClientRect();
                    var popupBox = popupElement.getBoundingClientRect();
                    var leftOffset = Math.max(0, (containerBox.left + margin) - parentBox.left);
                    var rightOffset = Math.min(0, (containerBox.left + containerBox.width - margin) - (parentBox.left + popupBox.width));
                    var topOffset = Math.max(0, (containerBox.top + margin) - parentBox.top);
                    var bottomOffset = Math.min(0, (containerBox.top + containerBox.height - margin) - (parentBox.top + popupBox.height));
                    popupElement.style.left = (leftOffset + rightOffset) + "px";
                    popupElement.style.top = (topOffset + bottomOffset) + "px";
                }
            }
            function createPopup(colorPicker) {
                currentControl = colorPicker;
                var currentHex = colorPicker.value;
                var currentRgb = ColorSpace.hexToRgb(currentHex);
                var currentHsv = ColorSpace.rgbToHsv(currentRgb);
                hsv.h = currentHsv.h;
                hsv.v = currentHsv.v;
                hsv.s = currentHsv.s;
                if (popupElement === null) {
                    buildPopup();
                }
                onColorChange();
                // reset placement to avoid flickering due to the popup being temporarily out of screen
                popupElement.style.top = "";
                popupElement.style.left = "";
                colorPicker.attachPopup(popupElement);
                fitPopupToContainer();
            }
            Popup.createPopup = createPopup;
        })(Popup || (Popup = {}));
        var colorPickersMap = {};
        window.addEventListener("load", function buildColorPickersMap() {
            var list = document.querySelectorAll(".color-picker");
            var _loop_1 = function (i) {
                var colorPickerElement = list[i];
                var colorPicker = new ColorPicker(colorPickerElement);
                if (colorPickerElement.id) {
                    colorPickersMap[colorPickerElement.id] = colorPicker;
                }
                colorPickerElement.addEventListener("click", function createPopup(event) {
                    Popup.createPopup(colorPicker);
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    event.preventDefault();
                });
            };
            for (var i = 0; i < list.length; i++) {
                _loop_1(i);
            }
        });
        // namespace Storage {
        //     const PREFIX = "color-picker";
        //     export function attachStorageEvents(): void {
        //         const checkboxesSelector = "div.checkbox > input[type=checkbox][id]";
        //         const checkboxes = document.querySelectorAll(checkboxesSelector) as NodeListOf<HTMLInputElement>;
        //         for (let i = 0; i < checkboxes.length; i++) {
        //             const checkbox = checkboxes[i];
        //             checkbox.addEventListener("change", () => {
        //                 const value = checkbox.checked ? CHECKED : UNCHECKED;
        //                 Page.Helpers.URL.setQueryParameter(PREFIX, checkbox.id, value);
        //             });
        //         }
        //     }
        //     export function applyStoredState(): void {
        //         Page.Helpers.URL.loopOnParameters(PREFIX, (checkboxId: string, value: string) => {
        //             const input = getCheckboxFromId(checkboxId);
        //             if (!input || (value !== CHECKED && value !== UNCHECKED)) {
        //                 console.log("Removing invalid query parameter '" + checkboxId + "=" + value + "'.");
        //                 Page.Helpers.URL.removeQueryParameter(PREFIX, checkboxId);
        //             } else {
        //                 input.checked = (value === CHECKED);
        //             }
        //         });
        //     }
        // }
        // Storage.applyStoredState();
        // Storage.attachStorageEvents();
        function addObserver(id, observer) {
            var colorPicker = colorPickersMap[id];
            if (colorPicker) {
                colorPicker.observers.push(observer);
            }
            return false;
        }
        ColorPicker_1.addObserver = addObserver;
        function getValue(id) {
            var hexValue = colorPickersMap[id].value;
            return ColorSpace.hexToRgb(hexValue);
        }
        ColorPicker_1.getValue = getValue;
        /**
         * @param id control id
         * @param r integer in [0, 255]
         * @param g integer in [0, 255]
         * @param b integer in [0, 255]
         */
        function setValue(id, r, g, b) {
            var rgb = { r: r, g: g, b: b };
            var hexValue = ColorSpace.rgbToHex(rgb);
            colorPickersMap[id].value = hexValue;
        }
        ColorPicker_1.setValue = setValue;
    })(ColorPicker = Page.ColorPicker || (Page.ColorPicker = {}));
})(Page || (Page = {}));

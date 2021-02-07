/// <reference path="../helpers.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.ColorPicker {
    interface IPoint {
        x: number;
        y: number;
    }

    function clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.max(min, value));
    }

    function roundAndClamp(value: number, min: number, max: number): number {
        const rounded = Math.round(value);
        return clamp(rounded, min, max);
    }

    namespace ColorSpace {
        export interface IRGB {
            r: number; // integer in [0, 255]
            g: number; // integer in [0, 255]
            b: number; // integer in [0, 255]
        }

        export interface IHSV {
            h: number; // integer in [0°, 360°]
            s: number; // in [0, 1]
            v: number; // in [0, 1]
        }

        export type Hexa = string; // in /#[0-9a-fA-F]{6} format

        export function hsvToRgb(hsv: IHSV): IRGB {
            const h2 = hsv.h / 60;
            const c = hsv.s * hsv.v;
            const x = c * (1 - Math.abs(h2 % 2 - 1));

            let rgb: IRGB;
            if (h2 <= 1) {
                rgb = { r: c, g: x, b: 0 };
            } else if (h2 <= 2) {
                rgb = { r: x, g: c, b: 0 };
            } else if (h2 <= 3) {
                rgb = { r: 0, g: c, b: x };
            } else if (h2 <= 4) {
                rgb = { r: 0, g: x, b: c };
            } else if (h2 <= 5) {
                rgb = { r: x, g: 0, b: c };
            } else {
                rgb = { r: c, g: 0, b: x };
            }

            const m = hsv.v - c;
            rgb.r = roundAndClamp((rgb.r + m) * 255, 0, 255);
            rgb.g = roundAndClamp((rgb.g + m) * 255, 0, 255);
            rgb.b = roundAndClamp((rgb.b + m) * 255, 0, 255);
            return rgb;
        }

        export function rgbToHsv(rgb: IRGB): IHSV {
            const nr = rgb.r / 255;
            const ng = rgb.g / 255;
            const nb = rgb.b / 255;

            const cmax = Math.max(nr, ng, nb);
            const cmin = Math.min(nr, ng, nb);
            const delta = cmax - cmin;

            const result: IHSV = { h: 0, s: 0, v: cmax };
            if (delta !== 0) {
                if (cmax === nr) {
                    result.h = 60 * (((ng - nb) / delta) % 6);
                } else if (cmax === ng) {
                    result.h = 60 * (((nb - nr) / delta) + 2);
                } else if (cmax === nb) {
                    result.h = 60 * (((nr - ng) / delta) + 4);
                }
            }

            if (cmax !== 0) {
                result.s = delta / cmax;
            }
            result.h = roundAndClamp(result.h, 0, 360);
            return result;
        }

        export function rgbToHex(rgb: IRGB): Hexa {
            return "#" + charToHex(rgb.r) + charToHex(rgb.g) + charToHex(rgb.b);
        }

        export function hexToRgb(hex: Hexa): IRGB {
            return {
                r: parseInt(hex.substring(1, 3), 16),
                g: parseInt(hex.substring(3, 5), 16),
                b: parseInt(hex.substring(5, 7), 16),
            };
        }

        function charToHex(value: number): string {
            const hex = value.toString(16).toUpperCase();
            return hex.length === 2 ? hex : "0" + hex;
        }
    }

    type ColorPicker = HTMLElement;

    function readCurrentColor(colorPicker: ColorPicker): ColorSpace.Hexa {
        return colorPicker.dataset.currentColor;
    }

    function writeNewColor(colorPicker: ColorPicker, color: ColorSpace.Hexa): void {
        colorPicker.dataset.currentColor = color;
        updateVisiblePart(colorPicker);
    }

    function updateVisiblePart(colorPicker: ColorPicker): void {
        const colorPreview = colorPicker.querySelector(".color-preview") as HTMLElement;
        const colorPreviewText = colorPicker.querySelector(".color-value") as HTMLElement;

        const hexValue = readCurrentColor(colorPicker);
        if (/^#[0-9a-fA-f]{6}$/.test(hexValue) && colorPreview && colorPreviewText) {
            colorPreview.style.background = hexValue;
            colorPreviewText.textContent = hexValue;
        }
    }

    namespace Popup {
        const ID = "color-picker-popup";

        let currentControl: ColorPicker;

        let popupElement: HTMLElement = null;
        let valueSaturationPicker: HTMLElement = null;
        let hueColorFilter: HTMLElement = null;
        let valueSaturationCursor: HTMLElement = null;

        let huePicker: HTMLElement = null;
        let hueCursor: HTMLElement = null;

        let previewColor: HTMLElement = null;
        let previewHexaValue: HTMLElement = null;
        let previewRgbValue: HTMLElement = null;
        let previewHslValue: HTMLElement = null;

        const hsv: ColorSpace.IHSV = { h: 200, s: 0.75, v: 0.5 };

        function buildPopup(): void {
            function buildElement(tagname: string, classList?: string[]): HTMLElement {
                const element = document.createElement(tagname);
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

                const valueColorFilter = buildElement("span", ["color-filter", "outlined"]);
                valueColorFilter.style.background = "linear-gradient(to top, black, rgba(0,0,0,0))";
                valueSaturationPicker.appendChild(valueColorFilter);

                valueSaturationCursor = buildElement("span", ["cursor"]);
                valueSaturationPicker.appendChild(valueSaturationCursor);

                popupElement.appendChild(valueSaturationPicker);
            }

            {
                huePicker = buildElement("div", ["block", "picker", "hue-picker"]);

                const hueBar = buildElement("span", ["hue-bar"]);
                huePicker.appendChild(hueBar);

                hueCursor = buildElement("span", ["cursor"]);
                huePicker.appendChild(hueCursor);

                popupElement.appendChild(huePicker);
            }

            {
                const previewBlock = buildElement("div", ["preview-block"]);

                previewColor = buildElement("div", ["preview-color", "outlined"]);
                previewColor.classList.add("block");
                previewBlock.appendChild(previewColor);

                {
                    const previewText = document.createElement("div");
                    previewText.classList.add("block");

                    function buildPreviewText(name: string): HTMLSpanElement {
                        const container = document.createElement("div");
                        const nameSpan = document.createElement("span");
                        nameSpan.textContent = name + ":";
                        nameSpan.classList.add("preview-text-label");
                        const valueSpan = document.createElement("span");
                        container.appendChild(nameSpan);
                        container.appendChild(valueSpan);
                        previewText.appendChild(container);
                        return valueSpan;
                    }

                    previewHexaValue = buildPreviewText("hex");
                    previewRgbValue = buildPreviewText("rgb");
                    previewHslValue = buildPreviewText("hsv");

                    previewBlock.appendChild(previewText);
                }

                popupElement.appendChild(previewBlock);
            }

            registerCursorEvent(huePicker, function (coords: IPoint): void {
                hsv.h = roundAndClamp(360 * coords.x, 0, 360);
                onColorChange();
            });

            registerCursorEvent(valueSaturationPicker, function (coords: IPoint): void {
                hsv.s = clamp(coords.x, 0, 1);
                hsv.v = clamp(1 - coords.y, 0, 1);
                onColorChange();

                // retain exact position because rebuilding it from color is not exact
                valueSaturationCursor.style.left = percentageString(coords.x);
                valueSaturationCursor.style.top = percentageString(coords.y);
            });

            let isActive = false;
            popupElement.addEventListener("mousedown", function setActive() {
                isActive = true;
            });
            window.addEventListener("mouseup", function checkIfPopupShouldBeDetached(event: MouseEvent): void {
                const clickedOutOfPopup = !popupElement.contains(event.target as Node);
                if (clickedOutOfPopup && popupElement.parentElement && !isActive) {
                    popupElement.parentElement.removeChild(popupElement);
                }
                isActive = false;
            });
        }

        function registerCursorEvent(container: HTMLElement, callback: (normalizedCoords: IPoint) => unknown): void {
            function absoluteToRelative(clientX: number, clientY: number): IPoint {
                const containerBox = container.getBoundingClientRect();
                const relativeX = (clientX - containerBox.left) / containerBox.width;
                const relativeY = (clientY - containerBox.top) / containerBox.height;
                return {
                    x: Math.max(0, Math.min(1, relativeX)),
                    y: Math.max(0, Math.min(1, relativeY)),
                };
            }

            const cursor = container.querySelector(".cursor");

            const handleOffset: IPoint = { x: 0, y: 0 };
            let isBeingDragged = false;
            container.addEventListener("mousedown", function onMouseDown(event: MouseEvent): void {
                isBeingDragged = true;
                handleOffset.x = 0;
                handleOffset.y = 0;
                if (cursor && event.target === cursor) {
                    const cursorBox = cursor.getBoundingClientRect();
                    handleOffset.x = 0.5 * cursorBox.width - (event.clientX - cursorBox.left);
                    handleOffset.y = 0.5 * cursorBox.height - (event.clientY - cursorBox.top);
                    console.log(JSON.stringify(handleOffset));
                } else {
                    const coords = absoluteToRelative(event.clientX, event.clientY);
                    callback(coords);
                }
            });

            window.addEventListener("mouseup", function onMouseUp(): void {
                isBeingDragged = false;
            });

            window.addEventListener("mousemove", function onMouseMove(event: MouseEvent): void {
                if (isBeingDragged) {
                    const coords = absoluteToRelative(event.clientX + handleOffset.x, event.clientY + handleOffset.y);
                    callback(coords);
                }
            });

            const currentTouchIds: number[] = [];
            container.addEventListener("touchstart", function onTouchStart(event: TouchEvent): void {
                isBeingDragged = true;
                const isFirstTouch = (currentTouchIds.length === 0);

                for (let i = 0; i < event.changedTouches.length; ++i) {
                    const touch = event.changedTouches[i];
                    let alreadyRegistered = false;
                    for (const knownTouchId of currentTouchIds) {
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
                    const coords = absoluteToRelative(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                    callback(coords);
                }
            }, false);
            window.addEventListener("touchend", function onTouchEnd(event: TouchEvent): void {
                const knewAtLeastOneTouch = (currentTouchIds.length > 0);

                for (let i = 0; i < event.changedTouches.length; ++i) {
                    const touch = event.changedTouches[i];
                    for (let iC = 0; iC < currentTouchIds.length; ++iC) {
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
            window.addEventListener("touchmove", function onTouchMove(event: TouchEvent): void {
                if (currentTouchIds.length > 0 && isBeingDragged) {
                    const touches = event.changedTouches;
                    for (let i = 0; i < touches.length; ++i) {
                        const touch = touches[i];
                        for (const knownTouch of currentTouchIds) {
                            if (touch.identifier === knownTouch) {
                                const coords = absoluteToRelative(touch.clientX, touch.clientY);
                                callback(coords);
                                event.preventDefault();
                                return;
                            }
                        }
                    }

                    
                }
            }, { passive: false });
        }

        function percentageString(value: number): string {
            return Math.round(100 * value) + "%";
        }

        function onColorChange(): void {
            const rgb = ColorSpace.hsvToRgb(hsv);
            const hexString = ColorSpace.rgbToHex(rgb);
            const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`; // real coor
            const hslString = `hsl(${hsv.h}, 100%, 50%)`; // pure color

            // colors
            hueColorFilter.style.background = `linear-gradient(to right, white, ${hslString})`;
            hueCursor.style.background = hslString;
            valueSaturationCursor.style.background = rgbString;
            previewColor.style.background = rgbString;

            // text
            previewHexaValue.textContent = hexString;
            previewRgbValue.textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
            previewHslValue.textContent = `${hsv.h}°, ${percentageString(hsv.s)}, ${percentageString(hsv.v)}`;

            // cursors positions
            hueCursor.style.left = percentageString(hsv.h / 360);
            valueSaturationCursor.style.left = percentageString(hsv.s);
            valueSaturationCursor.style.top = percentageString(1 - hsv.v);

            if (currentControl) {
                writeNewColor(currentControl, hexString);
            }
        }

        export function createPopup(colorPickerContainer: ColorPicker): void {
            currentControl = colorPickerContainer;

            const currentHex = readCurrentColor(colorPickerContainer);
            const currentRgb = ColorSpace.hexToRgb(currentHex);
            const currentHsv = ColorSpace.rgbToHsv(currentRgb);
            hsv.h = currentHsv.h;
            hsv.v = currentHsv.v;
            hsv.s = currentHsv.s;

            if (popupElement === null) {
                buildPopup();
            }
            onColorChange();

            colorPickerContainer.parentElement.appendChild(popupElement);
        }
    }

    const colorPickersMap: { [id: string]: ColorPicker } = {};

    window.addEventListener("load", function buildColorPickersMap(): void {
        const list = document.querySelectorAll(".color-picker") as NodeListOf<HTMLElement>;
        for (let i = 0; i < list.length; i++) {
            const colorPicker = list[i];
            if (colorPicker.id) {
                colorPickersMap[colorPicker.id] = colorPicker;
            }

            updateVisiblePart(colorPicker);

            colorPicker.addEventListener("click", function createPopup(event: MouseEvent): void {
                Popup.createPopup(colorPicker);
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();
            });
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
}

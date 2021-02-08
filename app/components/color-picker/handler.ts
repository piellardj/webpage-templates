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

    function positiveModulus(a: number, b: number): number {
        return ((a % b) + b) % b;
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

        export function parseHexa(value: string): Hexa | null {
            if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                return value.toUpperCase();
            }
            return null;
        }

        export function hsvToRgb(hsv: IHSV): IRGB {
            const h2 = hsv.h / 60;
            const c = hsv.s * hsv.v;
            const x = c * (1 - Math.abs(positiveModulus(h2, 2) - 1));

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
            result.h = positiveModulus(result.h, 360);
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

    type OnChangeObserver = (newValue: ColorSpace.IRGB) => unknown;
    class ColorPicker {
        public readonly observers: OnChangeObserver[] = [];
        public readonly id: string;

        private readonly element: HTMLElement
        private readonly colorPreview: HTMLElement;
        private readonly colorPreviewText: HTMLElement;

        public constructor(element: HTMLElement) {
            this.element = element;
            this.id = element.id;
            this.colorPreview = element.querySelector(".color-preview") as HTMLElement;
            this.colorPreviewText = element.querySelector(".color-value") as HTMLElement;
            this.updateVisiblePart();

            this.element.addEventListener("click", () => {
                Popup.createPopup(this);
            });
        }

        public set value(newValue: ColorSpace.Hexa) {
            const previousValue = this.value;
            if (previousValue !== newValue) {
                this.element.dataset.currentColor = newValue;
                this.updateVisiblePart();

                const rgb = ColorSpace.hexToRgb(newValue);
                for (const observer of this.observers) {
                    observer(rgb);
                }
            }
        }

        public get value(): ColorSpace.Hexa {
            return this.element.dataset.currentColor;
        }

        public attachPopup(popup: HTMLElement): void {
            this.element.parentElement.appendChild(popup);
        }

        private updateVisiblePart(): void {
            const hexValue = this.value;
            this.colorPreview.style.background = hexValue;
            this.colorPreviewText.textContent = hexValue;
        }
    }

    const colorPickersMap: { [id: string]: ColorPicker } = {};
    function getColorPicker(id: string): ColorPicker {
        if (!colorPickersMap[id]) {
            const element = document.querySelector(`#${id}.color-picker`) as HTMLElement;
            if (element) {
                colorPickersMap[id] = new ColorPicker(element);
            }
        }
        return colorPickersMap[id];
    }

    namespace Storage {
        const PREFIX = "color-picker";

        export function storeState(colorPicker: ColorPicker): void {
            Page.Helpers.URL.setQueryParameter(PREFIX, colorPicker.id, colorPicker.value);
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (controlId: string, value: string) => {
                const hexValue = ColorSpace.parseHexa(value);
                if (hexValue) {
                    const colorPicker = getColorPicker(controlId);
                    if (colorPicker) {
                        colorPicker.value = hexValue;
                    }
                }
            });
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
        let previewHexaValue: HTMLInputElement = null;
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
                    const previewText = buildElement("table", ["block"]);

                    function buildPreviewText(name: string): HTMLSpanElement {
                        const row = document.createElement("tr");
                        const nameSpan = document.createElement("td");
                        nameSpan.textContent = name + ":";
                        const valueSpan = document.createElement("td");
                        row.appendChild(nameSpan);
                        row.appendChild(valueSpan);
                        previewText.appendChild(row);
                        return valueSpan;
                    }

                    const hexaContainer = buildPreviewText("hexa");
                    previewHexaValue = document.createElement("input");
                    previewHexaValue.type = "text";
                    previewHexaValue.minLength = 7;
                    previewHexaValue.maxLength = 7;
                    previewHexaValue.size = 7;
                    previewHexaValue.pattern = "#[0-9a-fA-F]{6}";
                    previewHexaValue.addEventListener("input", function newHexaInput() {
                        const newValue = previewHexaValue.value;
                        const newHexa = ColorSpace.parseHexa(newValue);
                        if (newHexa) { // valid input
                            const newRgb = ColorSpace.hexToRgb(newValue);
                            const newHsl = ColorSpace.rgbToHsv(newRgb);
                            hsv.h = newHsl.h;
                            hsv.s = newHsl.s;
                            hsv.v = newHsl.v;
                            onInput();
                        }
                    });
                    hexaContainer.appendChild(previewHexaValue);
                    previewRgbValue = buildPreviewText("rgb");
                    previewHslValue = buildPreviewText("hsv");

                    previewBlock.appendChild(previewText);
                }

                popupElement.appendChild(previewBlock);
            }

            registerCursorEvent(huePicker, function (coords: IPoint): void {
                hsv.h = roundAndClamp(360 * coords.x, 0, 360);
                onInput();
            });

            registerCursorEvent(valueSaturationPicker, function (coords: IPoint): void {
                hsv.s = clamp(coords.x, 0, 1);
                hsv.v = clamp(1 - coords.y, 0, 1);
                onInput();

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

        function updateAppearance(): void {
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
            previewHexaValue.value = hexString;
            previewRgbValue.textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
            previewHslValue.textContent = `${hsv.h}°, ${percentageString(hsv.s)}, ${percentageString(hsv.v)}`;

            // cursors positions
            hueCursor.style.left = percentageString(hsv.h / 360);
            valueSaturationCursor.style.left = percentageString(hsv.s);
            valueSaturationCursor.style.top = percentageString(1 - hsv.v);
        }

        function onInput(): void {
            const rgb = ColorSpace.hsvToRgb(hsv);
            const hexString = ColorSpace.rgbToHex(rgb);
            updateAppearance();

            if (currentControl) {
                currentControl.value = hexString;
            }
            Storage.storeState(currentControl);
        }

        function fitPopupToContainer(): void {
            if (popupElement && popupElement.parentElement) {
                const container = document.querySelector(".controls-block") || document.body;
                const containerBox = container.getBoundingClientRect();
                const margin = 16;

                popupElement.style.maxWidth = (containerBox.width - 2 * margin) + "px";
                popupElement.style.maxHeight = (containerBox.height - 2 * margin) + "px";

                const parentBox = popupElement.parentElement.getBoundingClientRect();
                const popupBox = popupElement.getBoundingClientRect();
                const leftOffset = Math.max(0, (containerBox.left + margin) - parentBox.left);
                const rightOffset = Math.min(0, (containerBox.left + containerBox.width - margin) - (parentBox.left + popupBox.width));
                const topOffset = Math.max(0, (containerBox.top + margin) - parentBox.top);
                const bottomOffset = Math.min(0, (containerBox.top + containerBox.height - margin) - (parentBox.top + popupBox.height));
                popupElement.style.left = (leftOffset + rightOffset) + "px";
                popupElement.style.top = (topOffset + bottomOffset) + "px";
            }
        }

        export function createPopup(colorPicker: ColorPicker): void {
            currentControl = colorPicker;

            const currentHex = colorPicker.value;
            const currentRgb = ColorSpace.hexToRgb(currentHex);
            const currentHsv = ColorSpace.rgbToHsv(currentRgb);
            hsv.h = currentHsv.h;
            hsv.v = currentHsv.v;
            hsv.s = currentHsv.s;

            if (popupElement === null) {
                buildPopup();
            }
            updateAppearance();

            // reset placement to avoid flickering due to the popup being temporarily out of screen
            popupElement.style.top = "";
            popupElement.style.left = "";
            colorPicker.attachPopup(popupElement);
            fitPopupToContainer();
        }
    }

    window.addEventListener("load", function buildColorPickersMap(): void {
        const list = document.querySelectorAll(".color-picker") as NodeListOf<HTMLElement>;
        for (let i = 0; i < list.length; i++) {
            const colorPickerElement = list[i];
            const id = colorPickerElement.id;
            getColorPicker(id); // register the color picker
        }

        Storage.applyStoredState();
    });

    export function addObserver(id: string, observer: OnChangeObserver): boolean {
        const colorPicker = getColorPicker(id);
        if (colorPicker) {
            colorPicker.observers.push(observer);
        }
        return false;
    }

    export function getValue(id: string): ColorSpace.IRGB {
        const colorPicker = getColorPicker(id);
        const hexValue = colorPickersMap[id].value;
        return ColorSpace.hexToRgb(hexValue);
    }

    /**
     * @param id control id
     * @param r integer in [0, 255]
     * @param g integer in [0, 255]
     * @param b integer in [0, 255]
     */
    export function setValue(id: string, r: number, g: number, b: number): void {
        const rgb: ColorSpace.IRGB = {
            r: roundAndClamp(r, 0, 255),
            g: roundAndClamp(g, 0, 255),
            b: roundAndClamp(b, 0, 255),
        };
        const hexValue = ColorSpace.rgbToHex(rgb);
        const colorPicker = getColorPicker(id);
        colorPicker.value = hexValue;
    }
}

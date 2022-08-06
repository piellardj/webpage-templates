/// <reference path="../helpers.ts"/>

namespace Page.ColorPicker {
    interface IPoint {
        x: number;
        y: number;
    }

    function clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
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
            h: number; // in [0°, 360°]
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

    export type OnChangeObserver = (newValue: ColorSpace.IRGB) => unknown;
    class ColorPicker {
        public readonly observers: OnChangeObserver[] = [];
        public readonly id: string;

        private readonly element: HTMLElement;
        private readonly colorPreview: HTMLElement;
        private readonly colorPreviewText: HTMLElement;

        public constructor(element: HTMLElement) {
            this.element = element;
            this.id = element.id;
            this.colorPreview = element.querySelector(".color-preview") as HTMLElement;
            this.colorPreviewText = element.querySelector(".color-value") as HTMLElement;
            this.updateVisiblePart();

            this.element.addEventListener("click", () => {
                Popup.assignPopup(this);
            });
        }

        public set value(newValue: ColorSpace.Hexa) {
            const previousValue = this.value;
            if (previousValue !== newValue) {
                this.element.dataset["currentColor"] = newValue;
                this.updateVisiblePart();

                const rgb = ColorSpace.hexToRgb(newValue);
                for (const observer of this.observers) {
                    observer(rgb);
                }
            }
        }

        public get value(): ColorSpace.Hexa {
            return this.element.dataset["currentColor"];
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

    const colorPickersCache = new Page.Helpers.Cache<ColorPicker>("ColorPicker", () => {
        const colorPickersList: ColorPicker[] = [];
        const containers = document.querySelectorAll(".color-picker[id]") as NodeListOf<HTMLElement>;
        for (let i = 0; i < containers.length; i++) {
            const colorPicker = new ColorPicker(containers[i]);
            colorPickersList.push(colorPicker);
        }
        return colorPickersList;
    });

    const colorPickersStorage = new Page.Helpers.Storage<ColorPicker>("color-picker",
        (colorPicker: ColorPicker) => {
            return colorPicker.value;
        },
        (id: string, serializedValue: string) => {
            const colorPicker = colorPickersCache.getByIdSafe(id);
            const hexValue = ColorSpace.parseHexa(serializedValue);

            if (colorPicker && hexValue) {
                colorPicker.value = hexValue;
                return true;
            }
            return false;
        });

    class Popup {
        public static assignPopup(colorPicker: ColorPicker): void {
            if (!Popup.popup) {
                Popup.popup = new Popup();
            }
            Popup.popup.attach(colorPicker);
        }

        private static popup: Popup;

        private currentControl: ColorPicker;

        private readonly popupElement: HTMLElement;

        private readonly hsv: ColorSpace.IHSV = { h: 200, s: 0.75, v: 0.5 };

        private readonly valueSaturationPicker: HTMLElement;
        private readonly hueColorFilter: HTMLElement;
        private readonly valueSaturationCursor: HTMLElement;

        private readonly huePicker: HTMLElement;
        private readonly hueCursor: HTMLElement;

        private readonly previewColor: HTMLElement;
        private readonly previewHexaValue: HTMLInputElement;
        private readonly previewRgbValue: HTMLElement;
        private readonly previewHslValue: HTMLElement;

        private constructor() {
            this.popupElement = Popup.buildElement("div", ["popup", "color-picker-popup"]);

            {
                this.valueSaturationPicker = Popup.buildElement("div", ["block", "picker", "value-saturation-picker"]);

                this.hueColorFilter = Popup.buildElement("span", ["color-filter", "outlined"]);
                this.valueSaturationPicker.appendChild(this.hueColorFilter);

                const valueColorFilter = Popup.buildElement("span", ["color-filter", "outlined"]);
                valueColorFilter.style.background = "linear-gradient(to top, black, rgba(0,0,0,0))";
                this.valueSaturationPicker.appendChild(valueColorFilter);

                this.valueSaturationCursor = Popup.buildElement("span", ["cursor"]);
                this.valueSaturationPicker.appendChild(this.valueSaturationCursor);

                this.popupElement.appendChild(this.valueSaturationPicker);
            }

            {
                this.huePicker = Popup.buildElement("div", ["block", "picker", "hue-picker"]);

                const hueBar = Popup.buildElement("span", ["hue-bar"]);
                this.huePicker.appendChild(hueBar);

                this.hueCursor = Popup.buildElement("span", ["cursor"]);
                this.huePicker.appendChild(this.hueCursor);

                this.popupElement.appendChild(this.huePicker);
            }

            {
                const previewBlock = Popup.buildElement("div", ["preview-block"]);

                this.previewColor = Popup.buildElement("div", ["preview-color", "outlined"]);
                this.previewColor.classList.add("block");
                previewBlock.appendChild(this.previewColor);

                {
                    const previewText = Popup.buildElement("table", ["block"]);

                    const hexaContainer = Popup.buildPreviewText(previewText, "hexa");
                    const hash = Popup.buildElement("span");
                    hash.textContent = "#";
                    hexaContainer.appendChild(hash);
                    this.previewHexaValue = document.createElement("input");
                    this.previewHexaValue.type = "text";
                    this.previewHexaValue.minLength = 6;
                    this.previewHexaValue.maxLength = 6;
                    this.previewHexaValue.size = 6;
                    this.previewHexaValue.pattern = "[0-9a-fA-F]{6}";
                    this.previewHexaValue.addEventListener("input", () => {
                        const newValue = "#" + this.previewHexaValue.value;
                        const newHexa = ColorSpace.parseHexa(newValue);
                        if (newHexa) { // valid input
                            const newRgb = ColorSpace.hexToRgb(newValue);
                            const newHsl = ColorSpace.rgbToHsv(newRgb);
                            this.hsv.h = newHsl.h;
                            this.hsv.s = newHsl.s;
                            this.hsv.v = newHsl.v;
                            this.onInput();
                        }
                    });
                    hexaContainer.appendChild(this.previewHexaValue);
                    this.previewRgbValue = Popup.buildPreviewText(previewText, "rgb");
                    this.previewHslValue = Popup.buildPreviewText(previewText, "hsv");

                    previewBlock.appendChild(previewText);
                }

                this.popupElement.appendChild(previewBlock);
            }

            this.registerCursorEvent(this.huePicker, (coords: IPoint) => {
                this.hsv.h = roundAndClamp(360 * coords.x, 0, 360);
                this.onInput();
            });
            this.registerCursorEvent(this.valueSaturationPicker, (coords: IPoint) => {
                this.hsv.s = clamp(coords.x, 0, 1);
                this.hsv.v = clamp(1 - coords.y, 0, 1);
                this.onInput();
                // retain exact position because rebuilding it from color is not exact
                this.valueSaturationCursor.style.left = Popup.percentageString(coords.x);
                this.valueSaturationCursor.style.top = Popup.percentageString(coords.y);
            });

            let isActive = false;
            this.popupElement.addEventListener("mousedown", function setActive() {
                isActive = true;
            });
            window.addEventListener("mouseup", (event: MouseEvent) => {
                const clickedOutOfPopup = !this.popupElement.contains(event.target as Node);
                if (clickedOutOfPopup && this.popupElement.parentElement && !isActive) {
                    this.popupElement.parentElement.removeChild(this.popupElement);
                }
                isActive = false;
            });
        }

        private updateAppearance(): void {
            const rgb = ColorSpace.hsvToRgb(this.hsv);
            const hexString = ColorSpace.rgbToHex(rgb);
            const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`; // real coor
            const hslString = `hsl(${Math.round(this.hsv.h)}, 100%, 50%)`; // pure color

            // colors
            this.hueColorFilter.style.background = `linear-gradient(to right, white, ${hslString})`;
            this.hueCursor.style.background = hslString;
            this.valueSaturationCursor.style.background = rgbString;
            this.previewColor.style.background = rgbString;

            // text
            this.previewHexaValue.value = hexString.substring(1);
            this.previewRgbValue.textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
            const percentSaturation = Popup.percentageString(this.hsv.s);
            const percentValue = Popup.percentageString(this.hsv.v);
            this.previewHslValue.textContent = `${Math.round(this.hsv.h)}°, ${percentSaturation}, ${percentValue}`;

            // cursors positions
            this.hueCursor.style.left = Popup.percentageString(this.hsv.h / 360);
            this.valueSaturationCursor.style.left = percentSaturation;
            this.valueSaturationCursor.style.top = Popup.percentageString(1 - this.hsv.v);
        }

        private onInput(): void {
            const rgb = ColorSpace.hsvToRgb(this.hsv);
            const hexString = ColorSpace.rgbToHex(rgb);
            this.updateAppearance();

            if (this.currentControl) {
                this.currentControl.value = hexString;
            }
            colorPickersStorage.storeState(this.currentControl);
        }

        private attach(colorPicker: ColorPicker): void {
            this.currentControl = colorPicker;

            const currentHex = colorPicker.value;
            const currentRgb = ColorSpace.hexToRgb(currentHex);
            const currentHsv = ColorSpace.rgbToHsv(currentRgb);
            Popup.popup.hsv.h = currentHsv.h;
            Popup.popup.hsv.v = currentHsv.v;
            Popup.popup.hsv.s = currentHsv.s;

            Popup.popup.updateAppearance();

            // reset placement to avoid flickering due to the popup being temporarily out of screen
            this.popupElement.style.top = "";
            this.popupElement.style.left = "";
            this.currentControl.attachPopup(this.popupElement);
            this.fitPopupToContainer();
        }

        private fitPopupToContainer(): void {
            if (this.popupElement.parentElement) {
                const container = document.querySelector(".controls-block") || document.body;
                const containerBox = container.getBoundingClientRect();
                const margin = 16;
                const containerRight = containerBox.left + containerBox.width - margin;
                const containerBottom = containerBox.top + containerBox.height - margin;

                this.popupElement.style.maxWidth = (containerBox.width - 2 * margin) + "px";
                this.popupElement.style.maxHeight = (containerBox.height - 2 * margin) + "px";

                const parentBox = this.popupElement.parentElement.getBoundingClientRect();
                const popupBox = this.popupElement.getBoundingClientRect();
                const leftOffset = Math.max(0, (containerBox.left + margin) - parentBox.left);
                const rightOffset = Math.min(0, containerRight - (parentBox.left + popupBox.width));
                const topOffset = Math.max(0, (containerBox.top + margin) - parentBox.top);
                const bottomOffset = Math.min(0, containerBottom - (parentBox.top + popupBox.height));
                this.popupElement.style.left = (leftOffset + rightOffset) + "px";
                this.popupElement.style.top = (topOffset + bottomOffset) + "px";
            }
        }

        private registerCursorEvent(container: HTMLElement, callback: (normalizedCoords: IPoint) => unknown): void {
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

        private static buildElement(tagname: string, classList?: string[]): HTMLElement {
            const element = document.createElement(tagname);
            if (classList) {
                element.className = classList.join(" ");
            }
            return element;
        }

        private static buildPreviewText(container: HTMLElement, name: string): HTMLSpanElement {
            const row = document.createElement("tr");
            const nameSpan = document.createElement("td");
            nameSpan.textContent = name + ":";
            const valueSpan = document.createElement("td");
            row.appendChild(nameSpan);
            row.appendChild(valueSpan);
            container.appendChild(row);
            return valueSpan;
        }
        private static percentageString(value: number): string {
            return Math.round(100 * value) + "%";
        }
    }

    Helpers.Events.callAfterDOMLoaded(() => {
        colorPickersCache.load();
        colorPickersStorage.applyStoredState();
    });

    export function addObserver(id: string, observer: OnChangeObserver): void {
        const colorPicker = colorPickersCache.getById(id);
        colorPicker.observers.push(observer);
    }

    export function getValue(id: string): ColorSpace.IRGB {
        const colorPicker = colorPickersCache.getById(id);
        const hexValue = colorPicker.value;
        return ColorSpace.hexToRgb(hexValue);
    }

    export function getValueHex(id: string): ColorSpace.Hexa {
        const colorPicker = colorPickersCache.getById(id);
        return colorPicker.value;
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
        const colorPicker = colorPickersCache.getById(id);
        colorPicker.value = hexValue;
    }

    export function storeState(id: string): void {
        const colorPicker = colorPickersCache.getById(id);
        colorPickersStorage.storeState(colorPicker);
    }
    export function clearStoredState(id: string): void {
        const colorPicker = colorPickersCache.getById(id);
        colorPickersStorage.clearStoredState(colorPicker);
    }
}

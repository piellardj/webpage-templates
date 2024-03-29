/// <reference path="../helpers.d.ts" />
declare namespace Page.ColorPicker {
    namespace ColorSpace {
        interface IRGB {
            r: number;
            g: number;
            b: number;
        }
        interface IHSV {
            h: number;
            s: number;
            v: number;
        }
        type Hexa = string;
        function parseHexa(value: string): Hexa | null;
        function hsvToRgb(hsv: IHSV): IRGB;
        function rgbToHsv(rgb: IRGB): IHSV;
        function rgbToHex(rgb: IRGB): Hexa;
        function hexToRgb(hex: Hexa): IRGB;
    }
    export type OnChangeObserver = (newValue: ColorSpace.IRGB) => unknown;
    export function addObserver(id: string, observer: OnChangeObserver): void;
    export function getValue(id: string): ColorSpace.IRGB;
    export function getValueHex(id: string): ColorSpace.Hexa;
    /**
     * @param id control id
     * @param r integer in [0, 255]
     * @param g integer in [0, 255]
     * @param b integer in [0, 255]
     */
    export function setValue(id: string, r: number, g: number, b: number): void;
    export function storeState(id: string): void;
    export function clearStoredState(id: string): void;
    export {};
}

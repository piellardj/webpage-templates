declare namespace Page.Canvas {
    type CanvasResizeObserver = (newWidth: number, newHeight: number) => unknown;
    type FullscreenObserver = (isFullscreen: boolean) => unknown;
    type MouseDownObserver = () => unknown;
    type MouseUpObserver = () => unknown;
    type MouseDragObserver = (deltaX: number, deltaY: number) => unknown;
    type MouseMoveObserver = (newX: number, newY: number) => unknown;
    type MouseEnterObserver = () => unknown;
    type MouseLeaveObserver = () => unknown;
    type MouseWheelObserver = (delta: number, mousePosition: number[]) => unknown;
    export const Observers: Readonly<{
        canvasResize: CanvasResizeObserver[];
        fullscreenToggle: FullscreenObserver[];
        mouseDown: MouseDownObserver[];
        mouseDrag: MouseDragObserver[];
        mouseEnter: MouseEnterObserver[];
        mouseLeave: MouseLeaveObserver[];
        mouseMove: MouseMoveObserver[];
        mouseWheel: MouseWheelObserver[];
        mouseUp: MouseUpObserver[];
    }>;
    export function getAspectRatio(): number;
    export function getCanvas(): HTMLCanvasElement | null;
    export function getCanvasContainer(): HTMLElement | null;
    export function getSize(): number[];
    export function getMousePosition(): number[];
    export function isFullScreen(): boolean;
    export function isMouseDown(): boolean;
    export function setIndicatorText(id: string, text: string): void;
    export function setIndicatorsVisibility(visible: boolean): void;
    export function setMaxSize(newMaxWidth: number, newMaxHeight: number): void;
    export function setResizable(resizable: boolean): void;
    export function setLoaderText(text: string): void;
    export function showLoader(show: boolean): void;
    export function toggleFullscreen(fullscreen: boolean): void;
    export {};
}

/// <reference path="../../helpers.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Canvas {
    function getElementBySelector(selector: string): HTMLElement | null {
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find element '" + selector + "'.");
        }
        return elt as HTMLElement;
    }

    function getCanvasById(id: string): HTMLCanvasElement | null {
        return getElementBySelector("canvas[id=" + id + "]") as HTMLCanvasElement;
    }

    function getCheckboxFromId(id: string): HTMLInputElement | null {
        return getElementBySelector("input[type=checkbox][id=" + id + "]") as HTMLInputElement;
    }

    const canvasContainer = document.getElementById("canvas-container");
    const canvas = getCanvasById("canvas");
    const buttonsColumn = document.getElementById("canvas-buttons-column");
    const fullscreenCheckbox = getCheckboxFromId("fullscreen-checkbox-id");
    const sidePaneCheckbox = getCheckboxFromId("side-pane-checkbox-id");
    const loader = canvasContainer.querySelector(".loader") as HTMLElement;

    let maxWidth = 512;
    let maxHeight = 512;

    function bindCanvasButtons(): void {
        function hideOverflow(value: boolean): void {
            document.body.style.overflow = value ? "hidden" : "auto";
        }

        if (fullscreenCheckbox) {
            Helpers.Events.callAfterDOMLoaded(function () {
                hideOverflow(fullscreenCheckbox.checked);
                fullscreenCheckbox.addEventListener("change", function () {
                    hideOverflow(fullscreenCheckbox.checked);
                });
            });

            if (sidePaneCheckbox) {
                fullscreenCheckbox.addEventListener("change", function () {
                    if (fullscreenCheckbox.checked) {
                        sidePaneCheckbox.checked = false;
                    }
                }, false);
            }
        }
    }
    bindCanvasButtons();

    function getCanvasSize(): number[] {
        const rect = canvas.getBoundingClientRect();
        return [Math.floor(rect.width), Math.floor(rect.height)];
    }

    let lastCanvasSize = [0, 0];

    type CanvasResizeObserver = (newWidth: number, newHeight: number) => unknown;
    const canvasResizeObservers: CanvasResizeObserver[] = [];

    function inPx(size: number): string {
        return size + "px";
    }

    /**
     * Calls callbacks if needed.
     */
    function updateCanvasSize(): void {
        canvasContainer.style.width = "100vw";
        const size = getCanvasSize();

        if (fullscreenCheckbox.checked) {
            canvasContainer.style.height = "100%";
            canvasContainer.style.maxWidth = "";
            canvasContainer.style.maxHeight = "";
        } else {
            size[1] = size[0] * maxHeight / maxWidth;

            canvasContainer.style.height = inPx(size[1]);
            canvasContainer.style.maxWidth = inPx(maxWidth);
            canvasContainer.style.maxHeight = inPx(maxHeight);
        }

        if (size[0] !== lastCanvasSize[0] ||
            size[1] !== lastCanvasSize[1]) {
            lastCanvasSize = getCanvasSize();

            for (const observer of canvasResizeObservers) {
                observer(lastCanvasSize[0], lastCanvasSize[1]);
            }
        }
    }

    Helpers.Events.callAfterDOMLoaded(updateCanvasSize);
    fullscreenCheckbox.addEventListener("change", updateCanvasSize, false);
    window.addEventListener("resize", updateCanvasSize, false);

    type FullscreenObserver = (isFullscreen: boolean) => unknown;
    type MouseDownObserver = () => unknown;
    type MouseUpObserver = () => unknown;
    type MouseDragObserver = (deltaX: number, deltaY: number) => unknown;
    type MouseMoveObserver = (newX: number, newY: number) => unknown;
    type MouseEnterObserver = () => unknown;
    type MouseLeaveObserver = () => unknown;
    type MouseWheelObserver = (delta: number, mousePosition: number[]) => unknown;

    const fullscreenToggleObservers: FullscreenObserver[] = [updateCanvasSize];
    const mouseDownObservers: MouseDownObserver[] = [];
    const mouseUpObservers: MouseUpObserver[] = [];
    const mouseDragObservers: MouseDragObserver[] = [];
    const mouseMoveObservers: MouseMoveObserver[] = [];
    const mouseEnterObservers: MouseEnterObserver[] = [];
    const mouseLeaveObservers: MouseLeaveObserver[] = [];
    const mouseWheelObservers: MouseWheelObserver[] = [];

    /* Bind fullscreen events */
    if (fullscreenCheckbox) {
        fullscreenCheckbox.addEventListener("change", function () {
            const isFullscreen = fullscreenCheckbox.checked;
            for (const observer of fullscreenToggleObservers) {
                observer(isFullscreen);
            }
        }, false);
    }

    document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.keyCode === 27) {
            Canvas.toggleFullscreen(false);
        }
    });

    function clientToRelative(clientX: number, clientY: number): number[] {
        const rect = canvas.getBoundingClientRect();
        return [
            (clientX - rect.left) / rect.width,
            (clientY - rect.top) / rect.height,
        ];
    }

    namespace Mouse {
        const mousePosition: number[] = [];
        let isMouseDownInternal = false;

        export function getMousePosition(): number[] {
            return mousePosition.slice();
        }

        export function setMousePosition(x: number, y: number): void {
            mousePosition[0] = x;
            mousePosition[1] = y;
        }

        export function isMouseDown(): boolean {
            return isMouseDownInternal;
        }

        export function mouseDown(clientX: number, clientY: number): void {
            const pos = clientToRelative(clientX, clientY);

            setMousePosition(pos[0], pos[1]);

            isMouseDownInternal = true;
            for (const observer of mouseDownObservers) {
                observer();
            }
        }

        export function mouseUp(): void {
            if (isMouseDownInternal) {
                isMouseDownInternal = false;
                for (const observer of mouseUpObservers) {
                    observer();
                }
            }
        }

        export function mouseMove(clientX: number, clientY: number): void {
            const newPos = clientToRelative(clientX, clientY);

            const dX = newPos[0] - mousePosition[0];
            const dY = newPos[1] - mousePosition[1];

            // Update the mousePosition before calling the observers,
            // because they might call getMousePosition() and it needs to be up to date.
            mousePosition[0] = newPos[0];
            mousePosition[1] = newPos[1];

            if (isMouseDownInternal) {
                for (const observer of mouseDragObservers) {
                    observer(dX, dY);
                }
            }

            for (const observer of mouseMoveObservers) {
                observer(newPos[0], newPos[1]);
            }
        }

        if (canvas) {
            canvas.addEventListener("mousedown", function (event) {
                if (event.button === 0) {
                    mouseDown(event.clientX, event.clientY);
                }
            }, false);

            canvas.addEventListener("mouseenter", function () {
                for (const observer of mouseEnterObservers) {
                    observer();
                }
            }, false);

            canvas.addEventListener("mouseleave", function () {
                for (const observer of mouseLeaveObservers) {
                    observer();
                }
            }, false);

            canvas.addEventListener("wheel", function (event) {
                if (mouseWheelObservers.length > 0) {
                    const delta = (event.deltaY > 0) ? 1 : -1;

                    for (const observer of mouseWheelObservers) {
                        observer(delta, mousePosition);
                    }

                    event.preventDefault();
                    return false;
                }
                return true;
            }, false);

            window.addEventListener("mousemove", function (event) {
                mouseMove(event.clientX, event.clientY);
            });

            window.addEventListener("mouseup", function (event) {
                if (event.button === 0) {
                    mouseUp();
                }
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    namespace Touch {
        interface ITouch {
            id: number;
            clientX: number;
            clientY: number;
        }

        const currentTouches: ITouch[] = [];
        let currentDistance = 0; // for pinching management

        function computeDistance(firstTouch: ITouch, secondTouch: ITouch): number {
            const dX = firstTouch.clientX - secondTouch.clientX;
            const dY = firstTouch.clientY - secondTouch.clientY;
            return Math.sqrt(dX * dX + dY * dY);
        }

        function handleTouchStart(event: TouchEvent): void {
            const isFirstTouch = (currentTouches.length === 0);

            for (let i = 0; i < event.changedTouches.length; ++i) {
                const touch = event.changedTouches[i];
                let alreadyRegistered = false;
                for (const knownTouch of currentTouches) {
                    if (touch.identifier === knownTouch.id) {
                        alreadyRegistered = true;
                        break;
                    }
                }

                if (!alreadyRegistered) {
                    currentTouches.push({
                        id: touch.identifier,
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                    });
                }
            }

            if (isFirstTouch && currentTouches.length > 0) {
                const currentTouch = currentTouches[0];
                Mouse.mouseDown(currentTouch.clientX, currentTouch.clientY);
            } else if (currentTouches.length === 2) {
                currentDistance = computeDistance(currentTouches[0], currentTouches[1]);
            }
        }

        function handleTouchEnd(event: TouchEvent): void {
            const knewAtLeastOneTouch = (currentTouches.length > 0);

            for (let i = 0; i < event.changedTouches.length; ++i) {
                const touch = event.changedTouches[i];
                for (let iC = 0; iC < currentTouches.length; ++iC) {
                    if (touch.identifier === currentTouches[iC].id) {
                        currentTouches.splice(iC, 1);
                        iC--;
                    }
                }
            }

            if (currentTouches.length === 1) {
                const newPos = clientToRelative(currentTouches[0].clientX, currentTouches[0].clientY);
                Mouse.setMousePosition(newPos[0], newPos[1]);
            } else if (knewAtLeastOneTouch && currentTouches.length === 0) {
                Mouse.mouseUp();
            }
        }

        function handleTouchMove(event: TouchEvent): void {
            const touches = event.changedTouches;
            for (let i = 0; i < touches.length; ++i) {
                const touch = touches[i];
                for (const knownTouch of currentTouches) {
                    if (touch.identifier === knownTouch.id) {
                        knownTouch.clientX = touch.clientX;
                        knownTouch.clientY = touch.clientY;
                    }
                }
            }

            const nbObservers = mouseMoveObservers.length + mouseDragObservers.length;
            if (Mouse.isMouseDown() && nbObservers > 0) {
                event.preventDefault();
            }

            if (currentTouches.length === 1) {
                Mouse.mouseMove(currentTouches[0].clientX, currentTouches[0].clientY);
            } else if (currentTouches.length === 2) {
                const newDistance = computeDistance(currentTouches[0], currentTouches[1]);

                const deltaDistance = (currentDistance - newDistance);
                const zoomFactor = deltaDistance / currentDistance;
                currentDistance = newDistance;

                const zoomCenterXClient = 0.5 * (currentTouches[0].clientX + currentTouches[1].clientX);
                const zoomCenterYClient = 0.5 * (currentTouches[0].clientY + currentTouches[1].clientY);
                const zoomCenter = clientToRelative(zoomCenterXClient, zoomCenterYClient);

                for (const observer of mouseWheelObservers) {
                    observer(5 * zoomFactor, zoomCenter);
                }
            }
        }

        if (canvas) {
            canvas.addEventListener("touchstart", handleTouchStart, false);
            window.addEventListener("touchend", handleTouchEnd);
            window.addEventListener("touchmove", handleTouchMove, { passive: false });
        }
    }

    namespace Indicators {
        const indicatorSpansCache: {
            [id: string]: HTMLSpanElement,
        } = {};

        const suffix = "-indicator-id";

        export function getIndicator(id: string): HTMLElement {
            return getElementBySelector("#" + id + suffix);
        }

        export function getIndicatorSpan(id: string): HTMLSpanElement {
            if (!indicatorSpansCache[id]) { // not yet in cache
                const fullId = id + suffix;
                indicatorSpansCache[id] = getElementBySelector("#" + fullId + " span");
            }
            return indicatorSpansCache[id];
        }
    }

    namespace Storage {
        const PREFIX = "canvas";
        const FULLSCREEN_PARAMETER = "fullscreen";
        const SIDE_PANE_PARAMETER = "sidepane";
        const TRUE = "true";
        const FALSE = "false";

        function updateBooleanParameter(name: string, checked: boolean): void {
            const value = checked ? TRUE : FALSE;
            Page.Helpers.URL.setQueryParameter(PREFIX, name, value);
        }

        export function attachStorageEvents(): void {
            if (fullscreenCheckbox) {
                fullscreenCheckbox.addEventListener("change", () => {
                    updateBooleanParameter(FULLSCREEN_PARAMETER, fullscreenCheckbox.checked);
                    Page.Helpers.URL.removeQueryParameter(PREFIX, SIDE_PANE_PARAMETER);
                });
            }

            if (sidePaneCheckbox) {
                sidePaneCheckbox.addEventListener("change", () => {
                    updateBooleanParameter(SIDE_PANE_PARAMETER, sidePaneCheckbox.checked);
                });
            }
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (name: string, value: string) => {
                if (name === FULLSCREEN_PARAMETER && (value === TRUE || value === FALSE)) {
                    if (fullscreenCheckbox) {
                        fullscreenCheckbox.checked = (value === TRUE);
                    }
                } else if (name === SIDE_PANE_PARAMETER && (value === TRUE || value === FALSE)) {
                    if (sidePaneCheckbox) {
                        sidePaneCheckbox.checked = (value === TRUE);
                    }
                } else {
                    console.log("Removing invalid query parameter '" + name + "=" + value + "'.");
                    Page.Helpers.URL.removeQueryParameter(PREFIX, name);
                }
            });
        }
    }

    Storage.applyStoredState();
    Storage.attachStorageEvents();

    export const Observers = Object.freeze({
        canvasResize: canvasResizeObservers,
        fullscreenToggle: fullscreenToggleObservers,
        mouseDown: mouseDownObservers,
        mouseDrag: mouseDragObservers,
        mouseEnter: mouseEnterObservers,
        mouseLeave: mouseLeaveObservers,
        mouseMove: mouseMoveObservers,
        mouseWheel: mouseWheelObservers,
        mouseUp: mouseUpObservers,
    });

    export function getAspectRatio(): number {
        const size = getCanvasSize();
        return size[0] / size[1];
    }

    export function getCanvas(): HTMLCanvasElement | null {
        return canvas;
    }

    export function getCanvasContainer(): HTMLElement | null {
        return canvasContainer;
    }

    export function getSize(): number[] {
        return getCanvasSize();
    }

    export function getMousePosition(): number[] {
        return Mouse.getMousePosition();
    }

    export function isFullScreen(): boolean {
        return fullscreenCheckbox && fullscreenCheckbox.checked;
    }

    export function isMouseDown(): boolean {
        return Mouse.isMouseDown();
    }

    export function setIndicatorText(id: string, text: string): void {
        const indicator = Indicators.getIndicatorSpan(id);
        if (indicator) {
            indicator.innerText = text;
        }
    }

    export function setIndicatorVisibility(id: string, visible: boolean): void {
        const indicator = Indicators.getIndicator(id);
        if (indicator) {
            indicator.style.display = visible ? "" : "none";
        }
    }

    export function setIndicatorsVisibility(visible: boolean): void {
        const indicators = document.getElementById("indicators");
        indicators.style.display = visible ? "" : "none";
    }

    export function setMaxSize(newMaxWidth: number, newMaxHeight: number): void {
        maxWidth = newMaxWidth;
        maxHeight = newMaxHeight;

        updateCanvasSize();
    }

    export function setResizable(resizable: boolean): void {
        buttonsColumn.style.display = resizable ? "" : "none";
    }

    export function setLoaderText(text: string): void {
        if (loader) {
            loader.querySelector("span").innerText = text;
        }
    }

    export function showLoader(show: boolean): void {
        if (loader) {
            loader.style.display = (show) ? "block" : "";
        }
    }

    export function toggleFullscreen(fullscreen: boolean): void {
        if (fullscreenCheckbox) {
            const needToUpdate = fullscreen !== fullscreenCheckbox.checked;
            if (needToUpdate) {
                fullscreenCheckbox.checked = fullscreen;

                if (typeof window.CustomEvent === "function") {
                    fullscreenCheckbox.dispatchEvent(new CustomEvent("change"));
                } else if (typeof CustomEvent.prototype.initCustomEvent === "function") {
                    const changeEvent = document.createEvent("CustomEvent");
                    changeEvent.initCustomEvent("change", false, false, undefined);
                    fullscreenCheckbox.dispatchEvent(changeEvent);
                }
            }
        }
    }
}

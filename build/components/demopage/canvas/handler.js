/// <reference path="../../helpers.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var Canvas;
    (function (Canvas) {
        function getElementBySelector(selector) {
            var elt = document.querySelector(selector);
            if (!elt) {
                console.error("Cannot find element '" + selector + "'.");
            }
            return elt;
        }
        function getCanvasById(id) {
            return getElementBySelector("canvas[id=" + id + "]");
        }
        function getCheckboxFromId(id) {
            return getElementBySelector("input[type=checkbox][id=" + id + "]");
        }
        var canvasContainer = document.getElementById("canvas-container");
        var canvas = getCanvasById("canvas");
        var buttonsColumn = document.getElementById("canvas-buttons-column");
        var fullscreenCheckbox = getCheckboxFromId("fullscreen-checkbox-id");
        var sidePaneCheckbox = getCheckboxFromId("side-pane-checkbox-id");
        var loader = canvasContainer.querySelector(".loader");
        var maxWidth = 512;
        var maxHeight = 512;
        function bindCanvasButtons() {
            function hideOverflow(value) {
                document.body.style.overflow = value ? "hidden" : "auto";
            }
            if (fullscreenCheckbox) {
                Page.Helpers.Events.callAfterDOMLoaded(function () {
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
        function getCanvasSize() {
            var rect = canvas.getBoundingClientRect();
            return [Math.floor(rect.width), Math.floor(rect.height)];
        }
        var lastCanvasSize = [0, 0];
        var canvasResizeObservers = [];
        function inPx(size) {
            return size + "px";
        }
        /**
         * Calls callbacks if needed.
         */
        function updateCanvasSize() {
            canvasContainer.style.width = "100vw";
            var size = getCanvasSize();
            if (fullscreenCheckbox.checked) {
                canvasContainer.style.height = "100%";
                canvasContainer.style.maxWidth = "";
                canvasContainer.style.maxHeight = "";
            }
            else {
                size[1] = size[0] * maxHeight / maxWidth;
                canvasContainer.style.height = inPx(size[1]);
                canvasContainer.style.maxWidth = inPx(maxWidth);
                canvasContainer.style.maxHeight = inPx(maxHeight);
            }
            if (size[0] !== lastCanvasSize[0] ||
                size[1] !== lastCanvasSize[1]) {
                lastCanvasSize = getCanvasSize();
                for (var _i = 0, canvasResizeObservers_1 = canvasResizeObservers; _i < canvasResizeObservers_1.length; _i++) {
                    var observer = canvasResizeObservers_1[_i];
                    observer(lastCanvasSize[0], lastCanvasSize[1]);
                }
            }
        }
        Page.Helpers.Events.callAfterDOMLoaded(updateCanvasSize);
        fullscreenCheckbox.addEventListener("change", updateCanvasSize, false);
        window.addEventListener("resize", updateCanvasSize, false);
        var fullscreenToggleObservers = [updateCanvasSize];
        var mouseDownObservers = [];
        var mouseUpObservers = [];
        var mouseDragObservers = [];
        var mouseMoveObservers = [];
        var mouseEnterObservers = [];
        var mouseLeaveObservers = [];
        var mouseWheelObservers = [];
        /* Bind fullscreen events */
        if (fullscreenCheckbox) {
            fullscreenCheckbox.addEventListener("change", function () {
                var isFullscreen = fullscreenCheckbox.checked;
                for (var _i = 0, fullscreenToggleObservers_1 = fullscreenToggleObservers; _i < fullscreenToggleObservers_1.length; _i++) {
                    var observer = fullscreenToggleObservers_1[_i];
                    observer(isFullscreen);
                }
            }, false);
        }
        document.addEventListener("keydown", function (event) {
            if (event.keyCode === 27) {
                Canvas.toggleFullscreen(false);
            }
        });
        function clientToRelative(clientX, clientY) {
            var rect = canvas.getBoundingClientRect();
            return [
                (clientX - rect.left) / rect.width,
                (clientY - rect.top) / rect.height,
            ];
        }
        var Mouse;
        (function (Mouse) {
            var mousePosition = [];
            var clientMousePosition = [0, 0];
            var isMouseDownInternal = false;
            function getMousePosition() {
                return mousePosition.slice();
            }
            Mouse.getMousePosition = getMousePosition;
            function setMousePosition(x, y) {
                mousePosition[0] = x;
                mousePosition[1] = y;
            }
            Mouse.setMousePosition = setMousePosition;
            function isMouseDown() {
                return isMouseDownInternal;
            }
            Mouse.isMouseDown = isMouseDown;
            function mouseDown(clientX, clientY) {
                var pos = clientToRelative(clientX, clientY);
                setMousePosition(pos[0], pos[1]);
                isMouseDownInternal = true;
                for (var _i = 0, mouseDownObservers_1 = mouseDownObservers; _i < mouseDownObservers_1.length; _i++) {
                    var observer = mouseDownObservers_1[_i];
                    observer();
                }
            }
            Mouse.mouseDown = mouseDown;
            function mouseUp() {
                if (isMouseDownInternal) {
                    isMouseDownInternal = false;
                    for (var _i = 0, mouseUpObservers_1 = mouseUpObservers; _i < mouseUpObservers_1.length; _i++) {
                        var observer = mouseUpObservers_1[_i];
                        observer();
                    }
                }
            }
            Mouse.mouseUp = mouseUp;
            function mouseMove(clientX, clientY) {
                clientMousePosition[0] = clientX;
                clientMousePosition[1] = clientY;
                var newPos = clientToRelative(clientX, clientY);
                var dX = newPos[0] - mousePosition[0];
                var dY = newPos[1] - mousePosition[1];
                // Update the mousePosition before calling the observers,
                // because they might call getMousePosition() and it needs to be up to date.
                mousePosition[0] = newPos[0];
                mousePosition[1] = newPos[1];
                if (isMouseDownInternal) {
                    for (var _i = 0, mouseDragObservers_1 = mouseDragObservers; _i < mouseDragObservers_1.length; _i++) {
                        var observer = mouseDragObservers_1[_i];
                        observer(dX, dY);
                    }
                }
                for (var _a = 0, mouseMoveObservers_1 = mouseMoveObservers; _a < mouseMoveObservers_1.length; _a++) {
                    var observer = mouseMoveObservers_1[_a];
                    observer(newPos[0], newPos[1]);
                }
            }
            Mouse.mouseMove = mouseMove;
            if (canvas) {
                canvas.addEventListener("mousedown", function (event) {
                    if (event.button === 0) {
                        mouseDown(event.clientX, event.clientY);
                    }
                }, false);
                canvas.addEventListener("mouseenter", function () {
                    for (var _i = 0, mouseEnterObservers_1 = mouseEnterObservers; _i < mouseEnterObservers_1.length; _i++) {
                        var observer = mouseEnterObservers_1[_i];
                        observer();
                    }
                }, false);
                canvas.addEventListener("mouseleave", function () {
                    for (var _i = 0, mouseLeaveObservers_1 = mouseLeaveObservers; _i < mouseLeaveObservers_1.length; _i++) {
                        var observer = mouseLeaveObservers_1[_i];
                        observer();
                    }
                }, false);
                canvas.addEventListener("wheel", function (event) {
                    if (mouseWheelObservers.length > 0) {
                        var delta = (event.deltaY > 0) ? 1 : -1;
                        for (var _i = 0, mouseWheelObservers_1 = mouseWheelObservers; _i < mouseWheelObservers_1.length; _i++) {
                            var observer = mouseWheelObservers_1[_i];
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
                canvasResizeObservers.push(function () {
                    mouseMove(clientMousePosition[0], clientMousePosition[1]);
                });
            }
        })(Mouse || (Mouse = {}));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        var Touch;
        (function (Touch) {
            var currentTouches = [];
            var currentDistance = 0; // for pinching management
            function computeDistance(firstTouch, secondTouch) {
                var dX = firstTouch.clientX - secondTouch.clientX;
                var dY = firstTouch.clientY - secondTouch.clientY;
                return Math.sqrt(dX * dX + dY * dY);
            }
            function handleTouchStart(event) {
                var isFirstTouch = (currentTouches.length === 0);
                for (var i = 0; i < event.changedTouches.length; ++i) {
                    var touch = event.changedTouches[i];
                    var alreadyRegistered = false;
                    for (var _i = 0, currentTouches_1 = currentTouches; _i < currentTouches_1.length; _i++) {
                        var knownTouch = currentTouches_1[_i];
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
                    var currentTouch = currentTouches[0];
                    Mouse.mouseDown(currentTouch.clientX, currentTouch.clientY);
                }
                else if (currentTouches.length === 2) {
                    currentDistance = computeDistance(currentTouches[0], currentTouches[1]);
                }
            }
            function handleTouchEnd(event) {
                var knewAtLeastOneTouch = (currentTouches.length > 0);
                for (var i = 0; i < event.changedTouches.length; ++i) {
                    var touch = event.changedTouches[i];
                    for (var iC = 0; iC < currentTouches.length; ++iC) {
                        if (touch.identifier === currentTouches[iC].id) {
                            currentTouches.splice(iC, 1);
                            iC--;
                        }
                    }
                }
                if (currentTouches.length === 1) {
                    var newPos = clientToRelative(currentTouches[0].clientX, currentTouches[0].clientY);
                    Mouse.setMousePosition(newPos[0], newPos[1]);
                }
                else if (knewAtLeastOneTouch && currentTouches.length === 0) {
                    Mouse.mouseUp();
                }
            }
            function handleTouchMove(event) {
                var touches = event.changedTouches;
                for (var i = 0; i < touches.length; ++i) {
                    var touch = touches[i];
                    for (var _i = 0, currentTouches_2 = currentTouches; _i < currentTouches_2.length; _i++) {
                        var knownTouch = currentTouches_2[_i];
                        if (touch.identifier === knownTouch.id) {
                            knownTouch.clientX = touch.clientX;
                            knownTouch.clientY = touch.clientY;
                        }
                    }
                }
                var nbObservers = mouseMoveObservers.length + mouseDragObservers.length;
                if (Mouse.isMouseDown() && nbObservers > 0) {
                    event.preventDefault();
                }
                if (currentTouches.length === 1) {
                    Mouse.mouseMove(currentTouches[0].clientX, currentTouches[0].clientY);
                }
                else if (currentTouches.length === 2) {
                    var newDistance = computeDistance(currentTouches[0], currentTouches[1]);
                    var deltaDistance = (currentDistance - newDistance);
                    var zoomFactor = deltaDistance / currentDistance;
                    currentDistance = newDistance;
                    var zoomCenterXClient = 0.5 * (currentTouches[0].clientX + currentTouches[1].clientX);
                    var zoomCenterYClient = 0.5 * (currentTouches[0].clientY + currentTouches[1].clientY);
                    var zoomCenter = clientToRelative(zoomCenterXClient, zoomCenterYClient);
                    for (var _a = 0, mouseWheelObservers_2 = mouseWheelObservers; _a < mouseWheelObservers_2.length; _a++) {
                        var observer = mouseWheelObservers_2[_a];
                        observer(5 * zoomFactor, zoomCenter);
                    }
                }
            }
            if (canvas) {
                canvas.addEventListener("touchstart", handleTouchStart, false);
                window.addEventListener("touchend", handleTouchEnd);
                window.addEventListener("touchmove", handleTouchMove, { passive: false });
            }
        })(Touch || (Touch = {}));
        var Indicators;
        (function (Indicators) {
            var indicatorSpansCache = {};
            var suffix = "-indicator-id";
            function getIndicator(id) {
                return getElementBySelector("#" + id + suffix);
            }
            Indicators.getIndicator = getIndicator;
            function getIndicatorSpan(id) {
                if (!indicatorSpansCache[id]) { // not yet in cache
                    var fullId = id + suffix;
                    indicatorSpansCache[id] = getElementBySelector("#" + fullId + " span");
                }
                return indicatorSpansCache[id];
            }
            Indicators.getIndicatorSpan = getIndicatorSpan;
        })(Indicators || (Indicators = {}));
        var Storage;
        (function (Storage) {
            var PREFIX = "canvas";
            var FULLSCREEN_PARAMETER = "fullscreen";
            var SIDE_PANE_PARAMETER = "sidepane";
            var TRUE = "true";
            var FALSE = "false";
            function updateBooleanParameter(name, checked) {
                var value = checked ? TRUE : FALSE;
                Page.Helpers.URL.setQueryParameter(PREFIX, name, value);
            }
            function attachStorageEvents() {
                if (fullscreenCheckbox) {
                    fullscreenCheckbox.addEventListener("change", function () {
                        updateBooleanParameter(FULLSCREEN_PARAMETER, fullscreenCheckbox.checked);
                        Page.Helpers.URL.removeQueryParameter(PREFIX, SIDE_PANE_PARAMETER);
                    });
                }
                if (sidePaneCheckbox) {
                    sidePaneCheckbox.addEventListener("change", function () {
                        updateBooleanParameter(SIDE_PANE_PARAMETER, sidePaneCheckbox.checked);
                    });
                }
            }
            Storage.attachStorageEvents = attachStorageEvents;
            function applyStoredState() {
                Page.Helpers.URL.loopOnParameters(PREFIX, function (name, value) {
                    if (name === FULLSCREEN_PARAMETER && (value === TRUE || value === FALSE)) {
                        if (fullscreenCheckbox) {
                            fullscreenCheckbox.checked = (value === TRUE);
                        }
                    }
                    else if (name === SIDE_PANE_PARAMETER && (value === TRUE || value === FALSE)) {
                        if (sidePaneCheckbox) {
                            sidePaneCheckbox.checked = (value === TRUE);
                        }
                    }
                    else {
                        console.log("Removing invalid query parameter '" + name + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(PREFIX, name);
                    }
                });
            }
            Storage.applyStoredState = applyStoredState;
        })(Storage || (Storage = {}));
        Storage.applyStoredState();
        Storage.attachStorageEvents();
        Canvas.Observers = Object.freeze({
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
        function getAspectRatio() {
            var size = getCanvasSize();
            return size[0] / size[1];
        }
        Canvas.getAspectRatio = getAspectRatio;
        function getCanvas() {
            return canvas;
        }
        Canvas.getCanvas = getCanvas;
        function getCanvasContainer() {
            return canvasContainer;
        }
        Canvas.getCanvasContainer = getCanvasContainer;
        function getSize() {
            return getCanvasSize();
        }
        Canvas.getSize = getSize;
        function getMousePosition() {
            return Mouse.getMousePosition();
        }
        Canvas.getMousePosition = getMousePosition;
        function isFullScreen() {
            return fullscreenCheckbox && fullscreenCheckbox.checked;
        }
        Canvas.isFullScreen = isFullScreen;
        function isMouseDown() {
            return Mouse.isMouseDown();
        }
        Canvas.isMouseDown = isMouseDown;
        function setIndicatorText(id, text) {
            var indicator = Indicators.getIndicatorSpan(id);
            if (indicator) {
                indicator.innerText = text;
            }
        }
        Canvas.setIndicatorText = setIndicatorText;
        function setIndicatorVisibility(id, visible) {
            var indicator = Indicators.getIndicator(id);
            if (indicator) {
                indicator.style.display = visible ? "" : "none";
            }
        }
        Canvas.setIndicatorVisibility = setIndicatorVisibility;
        function setIndicatorsVisibility(visible) {
            var indicators = document.getElementById("indicators");
            indicators.style.display = visible ? "" : "none";
        }
        Canvas.setIndicatorsVisibility = setIndicatorsVisibility;
        function setMaxSize(newMaxWidth, newMaxHeight) {
            maxWidth = newMaxWidth;
            maxHeight = newMaxHeight;
            updateCanvasSize();
        }
        Canvas.setMaxSize = setMaxSize;
        function setResizable(resizable) {
            buttonsColumn.style.display = resizable ? "" : "none";
        }
        Canvas.setResizable = setResizable;
        function setLoaderText(text) {
            if (loader) {
                loader.querySelector("span").innerText = text;
            }
        }
        Canvas.setLoaderText = setLoaderText;
        function showLoader(show) {
            if (loader) {
                loader.style.display = (show) ? "block" : "";
            }
        }
        Canvas.showLoader = showLoader;
        function toggleFullscreen(fullscreen) {
            if (fullscreenCheckbox) {
                var needToUpdate = fullscreen !== fullscreenCheckbox.checked;
                if (needToUpdate) {
                    fullscreenCheckbox.checked = fullscreen;
                    if (typeof window.CustomEvent === "function") {
                        fullscreenCheckbox.dispatchEvent(new CustomEvent("change"));
                    }
                    else if (typeof CustomEvent.prototype.initCustomEvent === "function") {
                        var changeEvent = document.createEvent("CustomEvent");
                        changeEvent.initCustomEvent("change", false, false, undefined);
                        fullscreenCheckbox.dispatchEvent(changeEvent);
                    }
                }
            }
        }
        Canvas.toggleFullscreen = toggleFullscreen;
    })(Canvas = Page.Canvas || (Page.Canvas = {}));
})(Page || (Page = {}));

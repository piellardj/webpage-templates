/* exported Canvas */
const Canvas = (function() {
    /**
     * @param {string} selector
     * @return {Object} Html node or null if not found
     */
    function getElementBySelector(selector) {
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find element '" + selector + "'.");
        }
        return elt;
    }

    /**
     * @param {string} id
     * @return {Object} Html node or null if not found
     */
    function getCanvasById(id) {
        return getElementBySelector("canvas[id=" + id + "]");
    }

    /**
     * @param {string} id
     * @return {Object} Html node or null if not found
     */
    function getCheckboxFromId(id) {
        return getElementBySelector("input[type=checkbox][id=" + id + "]");
    }

    const canvasContainer = document.getElementById("canvas-container");
    const canvas = getCanvasById("canvas");
    const buttonsColumn = document.getElementById("canvas-buttons-column");
    const fullscreenCheckbox = getCheckboxFromId("fullscreen-checkbox-id");
    const loader = canvasContainer.querySelector(".loader");

    let maxWidth = 512;
    let maxHeight = 512;

    (function BindCanvasButtons() {
        /**
         * @param {boolean} value
         * @return {void}
         */
        function hideOverflow(value) {
            document.body.style.overflow = value ? "hidden" : "auto";
        }

        const sidePaneCheckbox = getCheckboxFromId("side-pane-checkbox-id");

        if (fullscreenCheckbox) {
            window.addEventListener("load", function() {
                hideOverflow(fullscreenCheckbox.checked);
                fullscreenCheckbox.addEventListener("change", function() {
                    hideOverflow(fullscreenCheckbox.checked);
                });
            }, false);

            if (sidePaneCheckbox) {
                fullscreenCheckbox.addEventListener("change", function() {
                    if (fullscreenCheckbox.checked) {
                        sidePaneCheckbox.checked = false;
                    }
                }, false);
            }
        }
    })();

    /**
     * @param {Array} observersList
     * @return {void}
     */
    function callObservers(observersList) {
        const args = Array.prototype.slice.call(arguments, 1);
        for (let i = 0; i < observersList.length; ++i) {
            observersList[i].apply(null, args);
        }
    }

    /**
     * @return {number[]}
     */
    function getCanvasSize() {
        const rect = canvas.getBoundingClientRect();
        return [Math.floor(rect.width), Math.floor(rect.height)];
    }

    let lastCanvasSize = [0, 0];
    const canvasResizeObservers = [];

    /**
     * @param {number} size
     * @return {string}
     */
    function inPx(size) {
        return size + "px";
    }

    /**
     * Calls callbacks if needed.
     * @return {void}
     */
    function updateCanvasSize() {
        canvasContainer.style["width"] = "100vw";
        const size = getCanvasSize();

        if (fullscreenCheckbox.checked) {
            canvasContainer.style["height"] = "100%";
            canvasContainer.style["max-width"] = "";
            canvasContainer.style["max-height"] = "";
        } else {
            size[1] = size[0] * maxHeight / maxWidth;

            canvasContainer.style["height"] = inPx(size[1]);
            canvasContainer.style["max-width"] = inPx(maxWidth);
            canvasContainer.style["max-height"] = inPx(maxHeight);
        }

        if (size[0] !== lastCanvasSize[0] ||
            size[1] !== lastCanvasSize[1]) {
            lastCanvasSize = getCanvasSize();

            callObservers(canvasResizeObservers,
                lastCanvasSize[0], lastCanvasSize[1]);
        }
    }

    window.addEventListener("load", updateCanvasSize, false);
    fullscreenCheckbox.addEventListener("change", updateCanvasSize, false);
    window.addEventListener("resize", updateCanvasSize, false);

    const lastMousePosition = [];
    let isMouseDown = false;

    const fullscreenToggleObservers = [updateCanvasSize];
    const mouseDownObservers = [];
    const mouseDragObservers = [];
    const mouseEnterObservers = [];
    const mouseLeaveObservers = [];
    const mouseMoveObservers = [];
    const mouseUpObservers = [];
    const mouseWheelObservers = [];

    /* Bind fullscreen events */
    if (fullscreenCheckbox) {
        fullscreenCheckbox.addEventListener("change", function() {
            callObservers(fullscreenToggleObservers,
                fullscreenCheckbox.checked);
        }, false);
    }

    /* Bind canvas events */
    if (canvas) {
        /**
         * @param {number} clientX
         * @param {number} clientY
         * @return {number[]}
         */
        function clientToRelative(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            return [
                (clientX - rect.left) / rect.width,
                (clientY - rect.top) / rect.height,
            ];
        }

        /**
         * @param {number} clientX
         * @param {number} clientY
         */
        function mouseDown(clientX, clientY) {
            const pos = clientToRelative(clientX, clientY);

            lastMousePosition[0] = pos[0];
            lastMousePosition[1] = pos[1];

            isMouseDown = true;
            callObservers(mouseDownObservers);
        }

        /**
         */
        function mouseUp() {
            if (isMouseDown) {
                isMouseDown = false;
                callObservers(mouseUpObservers);
            }
        }

        /**
         * @param {number} clientX
         * @param {number} clientY
         */
        function mouseMove(clientX, clientY) {
            const newPos = clientToRelative(clientX, clientY);

            const dX = newPos[0] - lastMousePosition[0];
            const dY = newPos[1] - lastMousePosition[1];

            lastMousePosition[0] = newPos[0];
            lastMousePosition[1] = newPos[1];

            if (isMouseDown) {
                callObservers(mouseDragObservers, dX, dY);
            }

            callObservers(mouseMoveObservers, newPos[0], newPos[1]);
        }

        canvas.addEventListener("mousedown", function(event) {
            if (event.button === 0) {
                mouseDown(event.clientX, event.clientY);
            }
        }, false);

        canvas.addEventListener("mouseenter", function() {
            callObservers(mouseEnterObservers);
        }, false);

        canvas.addEventListener("mouseleave", function() {
            callObservers(mouseLeaveObservers);
        }, false);

        canvas.addEventListener("wheel", function(event) {
            if (mouseWheelObservers.length > 0) {
                const delta = (event.deltaY > 0) ? 1 : -1;
                callObservers(mouseWheelObservers, delta, lastMousePosition);
                event.preventDefault();
                return false;
            }
            return true;
        }, false);

        window.addEventListener("mousemove", function(event) {
            mouseMove(event.clientX, event.clientY);
        });

        window.addEventListener("mouseup", function(event) {
            if (event.button === 0) {
                mouseUp();
            }
        });

        /* Touch events */
        const currentTouches = [];
        let currentDistance = 0; // for pinching management

        canvas.addEventListener("touchstart", function(event) {
            const previousLength = currentTouches.length;

            const touches = event.changedTouches;
            for (let i = 0; i < touches.length; ++i) {
                const touch = touches[i];
                let alreadyRegistered = false;
                for (let iC = 0; iC < currentTouches.length; ++iC) {
                    if (touch.identifier === currentTouches[iC].id) {
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

            if (previousLength === 0 && currentTouches.length > 0) {
                const currentTouch = currentTouches[0];
                mouseDown(currentTouch.clientX, currentTouch.clientY);
            } else if (currentTouches.length === 2) {
                const mainTouch = currentTouches[0];
                const secondTouch = currentTouches[1];
                const dX = mainTouch.clientX - secondTouch.clientX;
                const dY = mainTouch.clientY - secondTouch.clientY;
                currentDistance = Math.sqrt(dX * dX + dY * dY);
            }
        }, false);

        window.addEventListener("touchend", function(event) {
            const touches = event.changedTouches;
            for (let i = 0; i < touches.length; ++i) {
                const touch = touches[i];
                for (let iC = 0; iC < currentTouches.length; ++iC) {
                    if (touch.identifier === currentTouches[iC].id) {
                        currentTouches.splice(iC, 1);
                        iC--;
                    }
                }
            }

            if (currentTouches.length === 1) {
                const newPos = clientToRelative(currentTouches[0].clientX,
                    currentTouches[0].clientY);
                lastMousePosition[0] = newPos[0];
                lastMousePosition[1] = newPos[1];
            } else if (currentTouches.length === 0) {
                mouseUp();
            }
        });

        window.addEventListener("touchmove", function(event) {
            const touches = event.changedTouches;
            for (let i = 0; i < touches.length; ++i) {
                const touch = touches[i];
                for (let iC = 0; iC < currentTouches.length; ++iC) {
                    if (touch.identifier === currentTouches[iC].id) {
                        currentTouches[iC].clientX = touch.clientX;
                        currentTouches[iC].clientY = touch.clientY;
                    }
                }
            }

            if (isMouseDown && mouseWheelObservers.length > 0) {
                event.preventDefault();
            }

            if (currentTouches.length === 1) {
                mouseMove(currentTouches[0].clientX, currentTouches[0].clientY);
            } else if (currentTouches.length === 2) {
                const mainTouch = currentTouches[0];
                const secondTouch = currentTouches[1];
                const dX = mainTouch.clientX - secondTouch.clientX;
                const dY = mainTouch.clientY - secondTouch.clientY;
                const newDistance = Math.sqrt(dX * dX + dY * dY);

                const dDistance = (currentDistance - newDistance);
                const zoomFactor = dDistance / currentDistance;
                currentDistance = newDistance;

                const zoomCenter = clientToRelative(
                    0.5 * (currentTouches[0].clientX +
                        currentTouches[1].clientX),
                    0.5 * (currentTouches[0].clientY +
                        currentTouches[1].clientY));
                callObservers(mouseWheelObservers, 5 * zoomFactor, zoomCenter);
            }
        }, {passive: false});
    }

    /* Indicators cache */
    const indicatorSpans = {};

    /**
     * @param {string} id
     * @return {HTMLSpanElement}
     */
    function getIndicatorSpan(id) {
        if (!indicatorSpans[id]) {
            const fullId = id + "-indicator-id";
            indicatorSpans[id] = getElementBySelector("#" + fullId + " span");
        }
        return indicatorSpans[id];
    }

    return Object.freeze({
        Observers: Object.freeze({
            canvasResize: canvasResizeObservers,
            fullscreenToggle: fullscreenToggleObservers,
            mouseDown: mouseDownObservers,
            mouseDrag: mouseDragObservers,
            mouseEnter: mouseEnterObservers,
            mouseLeave: mouseLeaveObservers,
            mouseMove: mouseMoveObservers,
            mouseWheel: mouseWheelObservers,
            mouseUp: mouseUpObservers,
        }),

        /**
         * @return {number}
         */
        getAspectRatio: function() {
            const size = getCanvasSize();
            return size[0] / size[1];
        },

        /**
         * @return {Object} Html canvas node
         */
        getCanvas: function() {
            return canvas;
        },

        /**
         * @return {Object} Html canvas container node
         */
        getCanvasContainer: function() {
            return canvasContainer;
        },

        /**
         * @return {number[]}
         */
        getSize: getCanvasSize,

        /**
         * @return {number[]}
         */
        getMousePosition: function() {
            // return copy of array
            return lastMousePosition.slice();
        },

        /**
         * @return {boolean}
         */
        isFullScreen: function() {
            return fullscreenCheckbox && fullscreenCheckbox.checked;
        },

        /**
         * @return {boolean}
         */
        isMouseDown: function() {
            return isMouseDown;
        },

        /**
         * @param {string} id
         * @param {string} text
         * @return {void}
         */
        setIndicatorText: function(id, text) {
            const indicator = getIndicatorSpan(id);
            if (indicator) {
                indicator.innerText = text;
            }
        },

        /**
         * @param {boolean} visible
         * @return {void}
         */
        setIndicatorsVisibility: function(visible) {
            const indicators = document.getElementById("indicators");
            indicators.style.display = visible ? "block" : "none";
        },

        /**
         * @param {number} newMaxWidth
         * @param {number} newMaxHeight
         */
        setMaxSize: function(newMaxWidth, newMaxHeight) {
            maxWidth = newMaxWidth;
            maxHeight = newMaxHeight;

            updateCanvasSize();
        },

        /**
         * @param {boolean} resizable
         */
        setResizable: function(resizable) {
            buttonsColumn.style.display = resizable ? "block" : "none";
        },

        /**
         * @param {string} text
         */
        setLoaderText: function(text) {
            if (loader) {
                loader.querySelector("span").innerText = text;
            }
        },

        /**
         * @param {boolean} show
         */
        showLoader: function(show) {
            if (loader) {
                loader.style.display = (show) ? "block": "";
            }
        },

        /**
         * @param {boolean} fullscreen
         * @return {void}
         */
        toggleFullscreen: function(fullscreen) {
            if (fullscreenCheckbox) {
                const needToUpdate = fullscreen != fullscreenCheckbox.checked;
                if (needToUpdate) {
                    fullscreenCheckbox.checked = fullscreen;
                    fullscreenCheckbox.onchange();
                }
            }
        },
    });
})();

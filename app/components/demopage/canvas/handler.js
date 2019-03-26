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
            observersList[i].apply(args);
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
        let [curWidth, curHeight] = getCanvasSize();

        if (fullscreenCheckbox.checked) {
            canvasContainer.style["height"] = "100%";
            canvasContainer.style["max-width"] = "";
            canvasContainer.style["max-height"] = "";
        } else {
            curHeight = curWidth * maxHeight / maxWidth;

            canvasContainer.style["height"] = inPx(curHeight);
            canvasContainer.style["max-width"] = inPx(maxWidth);
            canvasContainer.style["max-height"] = inPx(maxHeight);
        }

        if (curWidth !== lastCanvasSize[0] ||
            curHeight !== lastCanvasSize[1]) {
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
        canvas.addEventListener("mousedown", function(event) {
            if (event.button === 0) {
                isMouseDown = true;
                callObservers(mouseDownObservers);
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
                callObservers(mouseWheelObservers, Math.sign(event.deltaY));
                event.preventDefault();
                return false;
            }
            return true;
        }, false);

        window.addEventListener("mousemove", function(event) {
            const rect = canvas.getBoundingClientRect();
            const newX = (event.clientX - rect.left) / rect.width;
            const newY = (event.clientY - rect.top) / rect.height;

            const dX = newX - lastMousePosition[0];
            const dY = newY - lastMousePosition[1];

            lastMousePosition[0] = newX;
            lastMousePosition[1] = newY;

            if (isMouseDown) {
                callObservers(mouseDragObservers, dX, dY);
            }

            console.log(newX + " : " + newY);
            callObservers(mouseMoveObservers, newX, newY);
        });

        window.addEventListener("mouseup", function(event) {
            if (event.button === 0 && isMouseDown) {
                isMouseDown = false;
                callObservers(mouseUpObservers);
            }
        });
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
         * @return {number[]}
         */
        getSize: getCanvasSize,

        /**
         * @return {number[]}
         */
        getMousePosition: function() {
            return lastMousePosition;
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
            const fullId = id + "-indicator-id";
            const indicator = document.getElementById(fullId);
            if (!indicator) {
                console.error("Cannot find indicator '" + fullId + "'.");
                return;
            }

            indicator.innerText = id + ": " + text;
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

Canvas.Observers.mouseDown.push(function() {
    console.log("mousedown");
});
Canvas.Observers.mouseUp.push(function() {
    console.log("mouseup");
});
Canvas.Observers.mouseMove.push(function(x, y) {
    console.log("moved (" + x + " ; " + y + ")");
});
Canvas.Observers.mouseDrag.push(function(x, y) {
    console.log("dragged (" + x + " ; " + y + ")");
});

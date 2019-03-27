/* exported Demopage */
const Demopage = (function() {
    const errorsBlockId = "error-messages";
    const errorsBlock = document.getElementById(errorsBlockId);
    if (!errorsBlock) {
        console.error("Cannot find element '" + errorsBlockId + "'.");
    }

    /**
     * @param {string} id
     * @return {object}
     */
    function getErrorById(id) {
        return errorsBlock.querySelector("span[id=error-message-" + id +"]");
    }

    return Object.freeze({
        /**
         * @param {string} id
         * @param {string} message
         */
        setErrorMessage: function(id, message) {
            if (errorsBlock) {
                const span = getErrorById(id);
                if (span) {
                    span.innerHTML = message;
                    return;
                } else {
                    const span = document.createElement("span");
                    span.id = "error-message-" + id;
                    span.innerText = message;
                    errorsBlock.appendChild(span);
                    errorsBlock.appendChild(document.createElement("br"));
                }
            }
        },

        /**
         * @param {string} id
         */
        removeErrorMessage: function(id) {
            if (errorsBlock) {
                const span = getErrorById(id);
                if (span) {
                    const br = span.nextElementSibling;
                    if (br) {
                        errorsBlock.removeChild(br);
                    }
                    errorsBlock.removeChild(span);
                }
            }
        },
    });
})();

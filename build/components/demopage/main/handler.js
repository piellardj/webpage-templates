/* exported Demopage */
const Demopage = (function() {
    const errorsBlockId = "error-messages";
    const errorsBlock = document.getElementById(errorsBlockId);
    if (!errorsBlock) {
        console.error("Cannot find element '" + errorsBlockId + "'.");
    }

    return Object.freeze({
        /**
         * @param {string} message
         */
        addErrorMessage: function(message) {
            if (errorsBlock) {
                const span = document.createElement("span");
                span.innerText = message;
                errorsBlock.appendChild(span);
                errorsBlock.appendChild(document.createElement("br"));
            }
        },
    });
})();

/* exported FileControl */
const FileControl = (function() {
    const filenameMaxSize = 16;

    /**
     * @param {string} name
     * @return {string}
     */
    function truncate(name) {
        if (name.length > filenameMaxSize) {
            return name.substring(0, 15) + "..." +
                name.substring(name.length-15);
        }
        return name;
    }

    /**
     * @param {string} selector
     * @return {Object} Html node or null if not found
     */
    function getElementBySelector(selector) {
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find input file '" + selector + "'.");
        }
        return elt;
    }

    /**
     * @param {string} id
     * @return {Object} Html node or null if not found
     */
    function getUploadInputById(id) {
        const selector = "input[type=file][id=" + id + "]";
        return getElementBySelector(selector);
    }

    /**
     * @param {string} id
     * @return {Object} Html node or null if not found
     */
    function getDownloadLabel(id) {
        const selector = ".file-control.download > label[id=" + id + "]";
        return getElementBySelector(selector);
    }

    /* Bind event so that filename is displayed on upload */
    const labelsSelector = ".file-control.upload > label";
    window.addEventListener("load", function() {
        const labels = document.querySelectorAll(labelsSelector);
        labels.forEach(function(label) {
            const input = getUploadInputById(label.htmlFor);
            if (input) {
                const span = label.querySelector("span");
                input.addEventListener("change", function(event) {
                    span.innerText = truncate(input.files[0].name);
                });
            }
        });
    });

    return Object.freeze({
        /**
         * @param {string} id
         * @param {Object} observer Callback function
         * @return {boolean} Whether or not the observer was added
         */
        addDownloadObserver: function(id, observer) {
            const elt = getDownloadLabel(id);
            if (elt) {
                elt.addEventListener("click", function() {
                    event.stopPropagation();
                    observer();
                });
                return true;
            }

            return false;
        },

        /**
         * @param {string} uploadId
         * @param {Object} observer Callback function
         * @return {boolean} Whether or not the observer was added
         */
        addUploadObserver: function(uploadId, observer) {
            const input = getUploadInputById(uploadId);
            if (input) {
                input.addEventListener("change", function() {
                    event.stopPropagation();
                    observer(input.files);
                });
                return true;
            }

            return false;
        },
    });
})();

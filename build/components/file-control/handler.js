// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var FileControl;
    (function (FileControl) {
        var filenameMaxSize = 16;
        function truncate(name) {
            if (name.length > filenameMaxSize) {
                return name.substring(0, 15) + "..." +
                    name.substring(name.length - 15);
            }
            return name;
        }
        function getElementBySelector(selector) {
            var elt = document.querySelector(selector);
            if (!elt) {
                console.error("Cannot find input file '" + selector + "'.");
            }
            return elt;
        }
        function getUploadInputById(id) {
            var selector = "input[type=file][id=" + id + "]";
            return getElementBySelector(selector);
        }
        function getDownloadLabel(id) {
            var selector = ".file-control.download > label[id=" + id + "]";
            return getElementBySelector(selector);
        }
        /* Bind event so that filename is displayed on upload */
        var labelsSelector = ".file-control.upload > label";
        window.addEventListener("load", function () {
            var labels = document.querySelectorAll(labelsSelector);
            Array.prototype.forEach.call(labels, function (label) {
                var input = getUploadInputById(label.htmlFor);
                if (input) {
                    var span_1 = label.querySelector("span");
                    input.addEventListener("change", function () {
                        if (input.files.length === 1) {
                            span_1.innerText = truncate(input.files[0].name);
                        }
                    }, false);
                }
            });
        });
        /**
         * @return {boolean} Whether or not the observer was added
         */
        function addDownloadObserver(id, observer) {
            var elt = getDownloadLabel(id);
            if (elt) {
                elt.addEventListener("click", function () {
                    event.stopPropagation();
                    observer();
                }, false);
                return true;
            }
            return false;
        }
        FileControl.addDownloadObserver = addDownloadObserver;
        /**
         * @return {boolean} Whether or not the observer was added
         */
        function addUploadObserver(uploadId, observer) {
            var input = getUploadInputById(uploadId);
            if (input) {
                input.addEventListener("change", function () {
                    event.stopPropagation();
                    if (input.files.length === 1) {
                        observer(input.files);
                    }
                }, false);
                return true;
            }
            return false;
        }
        FileControl.addUploadObserver = addUploadObserver;
    })(FileControl = Page.FileControl || (Page.FileControl = {}));
})(Page || (Page = {}));

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
            var selector = ".file-control.upload > input[type=file][id=" + id + "]";
            return getElementBySelector(selector);
        }
        function getDownloadInputById(id) {
            var selector = ".file-control.download > input[type=button][id=" + id + "]";
            return getElementBySelector(selector);
        }
        /* Bind event so that filename is displayed on upload */
        var labelsSelector = ".file-control.upload > label";
        window.addEventListener("load", function () {
            var labels = document.querySelectorAll(labelsSelector);
            var _loop_1 = function (i) {
                var label = labels[i];
                var input = getUploadInputById(label.htmlFor);
                if (input) {
                    var span_1 = label.querySelector("span");
                    input.addEventListener("change", function () {
                        if (input.files.length === 1) {
                            span_1.innerText = truncate(input.files[0].name);
                        }
                    }, false);
                }
            };
            for (var i = 0; i < labels.length; i++) {
                _loop_1(i);
            }
        });
        /**
         * @return {boolean} Whether or not the observer was added
         */
        function addDownloadObserver(id, observer) {
            var input = getDownloadInputById(id);
            if (input) {
                input.addEventListener("click", function () {
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

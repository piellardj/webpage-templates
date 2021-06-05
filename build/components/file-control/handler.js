// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Page;
(function (Page) {
    var FileControl;
    (function (FileControl) {
        var FileUpload = /** @class */ (function () {
            function FileUpload(container) {
                var _this = this;
                this.observers = [];
                this.inputElement = container.querySelector("input");
                this.labelSpanElement = container.querySelector("label > span");
                this.inputElement.addEventListener("change", function (event) {
                    event.stopPropagation();
                    var files = _this.inputElement.files;
                    if (files.length === 1) {
                        _this.labelSpanElement.innerText = FileUpload.truncate(files[0].name);
                        for (var _i = 0, _a = _this.observers; _i < _a.length; _i++) {
                            var observer = _a[_i];
                            observer(files);
                        }
                    }
                }, false);
            }
            FileUpload.prototype.clear = function () {
                this.inputElement.value = "";
                this.labelSpanElement.innerText = this.labelSpanElement.dataset.placeholder;
            };
            FileUpload.truncate = function (name) {
                if (name.length > FileUpload.filenameMaxSize) {
                    return name.substring(0, FileUpload.filenameMaxSize - 1) + "..." +
                        name.substring(name.length - (FileUpload.filenameMaxSize - 1));
                }
                return name;
            };
            FileUpload.filenameMaxSize = 16;
            return FileUpload;
        }());
        var FileDownload = /** @class */ (function () {
            function FileDownload(container) {
                var _this = this;
                this.observers = [];
                this.buttonElement = container.querySelector("input");
                this.buttonElement.addEventListener("click", function (event) {
                    event.stopPropagation();
                    for (var _i = 0, _a = _this.observers; _i < _a.length; _i++) {
                        var observer = _a[_i];
                        observer();
                    }
                }, false);
            }
            return FileDownload;
        }());
        var Cache;
        (function (Cache) {
            function loadFileUploadsCache() {
                var result = {};
                var selector = ".file-control.upload > input[id]";
                var fileUploadInputsElements = document.querySelectorAll(selector);
                for (var i = 0; i < fileUploadInputsElements.length; i++) {
                    var container = fileUploadInputsElements[i].parentElement;
                    var id = fileUploadInputsElements[i].id;
                    result[id] = new FileUpload(container);
                }
                return result;
            }
            function loadFileDownloadsCache() {
                var result = {};
                var selector = ".file-control.download > input[id]";
                var fileDownloadInputsElements = document.querySelectorAll(selector);
                for (var i = 0; i < fileDownloadInputsElements.length; i++) {
                    var container = fileDownloadInputsElements[i].parentElement;
                    var id = fileDownloadInputsElements[i].id;
                    result[id] = new FileDownload(container);
                }
                return result;
            }
            var fileUploadsCache;
            var fileDownloadsCache;
            function getFileUploadById(id) {
                Cache.load();
                return fileUploadsCache[id] || null;
            }
            Cache.getFileUploadById = getFileUploadById;
            function getFileDownloadById(id) {
                Cache.load();
                return fileDownloadsCache[id] || null;
            }
            Cache.getFileDownloadById = getFileDownloadById;
            function load() {
                if (typeof fileUploadsCache === "undefined") {
                    fileUploadsCache = loadFileUploadsCache();
                }
                if (typeof fileDownloadsCache === "undefined") {
                    fileDownloadsCache = loadFileDownloadsCache();
                }
            }
            Cache.load = load;
        })(Cache || (Cache = {}));
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            Cache.load();
        });
        /**
         * @return {boolean} Whether or not the observer was added
         */
        function addDownloadObserver(id, observer) {
            var fileDownload = Cache.getFileDownloadById(id);
            if (fileDownload) {
                fileDownload.observers.push(observer);
                return true;
            }
            return false;
        }
        FileControl.addDownloadObserver = addDownloadObserver;
        /**
         * @return {boolean} Whether or not the observer was added
         */
        function addUploadObserver(uploadId, observer) {
            var fileUpload = Cache.getFileUploadById(uploadId);
            if (fileUpload) {
                fileUpload.observers.push(observer);
                return true;
            }
            return false;
        }
        FileControl.addUploadObserver = addUploadObserver;
        function clearFileUpload(id) {
            var fileUpload = Cache.getFileUploadById(id);
            fileUpload.clear();
        }
        FileControl.clearFileUpload = clearFileUpload;
    })(FileControl = Page.FileControl || (Page.FileControl = {}));
})(Page || (Page = {}));

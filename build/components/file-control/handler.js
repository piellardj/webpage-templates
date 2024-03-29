var Page;
(function (Page) {
    var FileControl;
    (function (FileControl) {
        var FileUpload = /** @class */ (function () {
            function FileUpload(container) {
                var _this = this;
                this.observers = [];
                this.inputElement = Page.Helpers.Utils.selector(container, "input");
                this.labelSpanElement = Page.Helpers.Utils.selector(container, "label > span");
                this.id = this.inputElement.id;
                this.inputElement.addEventListener("change", function (event) {
                    event.stopPropagation();
                    var files = _this.inputElement.files;
                    if (files && files.length === 1) {
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
                this.labelSpanElement.innerText = this.labelSpanElement.dataset["placeholder"] || "Upload";
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
                this.buttonElement = Page.Helpers.Utils.selector(container, "input");
                this.id = this.buttonElement.id;
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
        var fileUploadsCache = new Page.Helpers.Cache("FileUpload", function () {
            var selector = ".file-control.upload > input[id]";
            var fileUploadInputsElements = Page.Helpers.Utils.selectorAll(document, selector);
            return fileUploadInputsElements.map(function (fileUploadInputsElement) {
                var container = fileUploadInputsElement.parentElement;
                var fileUpload = new FileUpload(container);
                return fileUpload;
            });
        });
        var fileDownloadsCache = new Page.Helpers.Cache("FileDownload", function () {
            var selector = ".file-control.download > input[id]";
            var fileDownloadInputsElements = Page.Helpers.Utils.selectorAll(document, selector);
            return fileDownloadInputsElements.map(function (fileDownloadInputsElement) {
                var container = fileDownloadInputsElement.parentElement;
                return new FileDownload(container);
            });
        });
        Page.Helpers.Events.callAfterDOMLoaded(function () {
            fileUploadsCache.load();
            fileUploadsCache.load();
        });
        function addDownloadObserver(id, observer) {
            var fileDownload = fileDownloadsCache.getById(id);
            fileDownload.observers.push(observer);
        }
        FileControl.addDownloadObserver = addDownloadObserver;
        function addUploadObserver(id, observer) {
            var fileUpload = fileUploadsCache.getById(id);
            fileUpload.observers.push(observer);
        }
        FileControl.addUploadObserver = addUploadObserver;
        function clearFileUpload(id) {
            var fileUpload = fileUploadsCache.getById(id);
            fileUpload.clear();
        }
        FileControl.clearFileUpload = clearFileUpload;
    })(FileControl = Page.FileControl || (Page.FileControl = {}));
})(Page || (Page = {}));

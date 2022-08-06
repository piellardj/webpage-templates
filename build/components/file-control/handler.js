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
                this.id = this.inputElement.id;
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
                this.labelSpanElement.innerText = this.labelSpanElement.dataset["placeholder"];
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
            var fileUploadsList = [];
            var selector = ".file-control.upload > input[id]";
            var fileUploadInputsElements = document.querySelectorAll(selector);
            for (var i = 0; i < fileUploadInputsElements.length; i++) {
                var container = fileUploadInputsElements[i].parentElement;
                var fileUpload = new FileUpload(container);
                fileUploadsList.push(fileUpload);
            }
            return fileUploadsList;
        });
        var fileDownloadsCache = new Page.Helpers.Cache("FileDownload", function () {
            var fileDownloadsList = [];
            var selector = ".file-control.download > input[id]";
            var fileDownloadInputsElements = document.querySelectorAll(selector);
            for (var i = 0; i < fileDownloadInputsElements.length; i++) {
                var container = fileDownloadInputsElements[i].parentElement;
                var fileDownload = new FileDownload(container);
                fileDownloadsList.push(fileDownload);
            }
            return fileDownloadsList;
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

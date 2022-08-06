declare namespace Page.FileControl {
    type FileDownloadObserver = () => unknown;
    type FileUploadObserver = (files: FileList) => unknown;
    function addDownloadObserver(id: string, observer: FileDownloadObserver): void;
    function addUploadObserver(id: string, observer: FileUploadObserver): void;
    function clearFileUpload(id: string): void;
}

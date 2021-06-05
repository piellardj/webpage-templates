declare namespace Page.FileControl {
    type FileDownloadObserver = () => unknown;
    type FileUploadObserver = (files: FileList) => unknown;
    /**
     * @return {boolean} Whether or not the observer was added
     */
    function addDownloadObserver(id: string, observer: FileDownloadObserver): boolean;
    /**
     * @return {boolean} Whether or not the observer was added
     */
    function addUploadObserver(uploadId: string, observer: FileUploadObserver): boolean;
    function clearFileUpload(id: string): void;
}

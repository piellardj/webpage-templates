declare namespace FileControl {
    type DownloadObserver = () => unknown;
    type UploadObserver = (files: FileList) => unknown;
    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addDownloadObserver(id: string, observer: DownloadObserver): boolean;
    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addUploadObserver(uploadId: string, observer: UploadObserver): boolean;
    export {};
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.FileControl {
    export type FileDownloadObserver = () => unknown;
    export type FileUploadObserver = (files: FileList) => unknown;

    class FileUpload {
        private readonly inputElement: HTMLInputElement;
        private readonly labelSpanElement: HTMLElement;

        public readonly observers: FileUploadObserver[] = [];

        public constructor(container: HTMLElement) {
            this.inputElement = container.querySelector("input");
            this.labelSpanElement = container.querySelector("label > span");

            this.inputElement.addEventListener("change", (event: Event) => {
                event.stopPropagation();
                const files = this.inputElement.files;
                if (files.length === 1) {
                    this.labelSpanElement.innerText = FileUpload.truncate(files[0].name);

                    for (const observer of this.observers) {
                        observer(files);
                    }
                }
            }, false);
        }

        public clear(): void {
            this.inputElement.value = "";
            this.labelSpanElement.innerText = this.labelSpanElement.dataset.placeholder;
        }

        private static readonly filenameMaxSize: number = 16;

        private static truncate(name: string): string {
            if (name.length > FileUpload.filenameMaxSize) {
                return name.substring(0, FileUpload.filenameMaxSize - 1) + "..." +
                    name.substring(name.length - (FileUpload.filenameMaxSize - 1));
            }
            return name;
        }
    }

    class FileDownload {
        private readonly buttonElement: HTMLInputElement;

        public readonly observers: FileDownloadObserver[] = [];

        public constructor(container: HTMLElement) {
            this.buttonElement = container.querySelector("input");
            this.buttonElement.addEventListener("click", (event: Event) => {
                event.stopPropagation();
                for (const observer of this.observers) {
                    observer();
                }
            }, false);
        }
    }

    namespace Cache {
        type FileUploadsCache = { [id: string]: FileUpload };
        type FileDownloadsCache = { [id: string]: FileDownload };

        function loadFileUploadsCache(): FileUploadsCache {
            const result: FileUploadsCache = {};

            const selector = ".file-control.upload > input[id]";
            const fileUploadInputsElements = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
            for (let i = 0; i < fileUploadInputsElements.length; i++) {
                const container = fileUploadInputsElements[i].parentElement;
                const id = fileUploadInputsElements[i].id;
                result[id] = new FileUpload(container);
            }

            return result;
        }

        function loadFileDownloadsCache(): FileDownloadsCache {
            const result: FileDownloadsCache = {};

            const selector = ".file-control.download > input[id]";
            const fileDownloadInputsElements = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
            for (let i = 0; i < fileDownloadInputsElements.length; i++) {
                const container = fileDownloadInputsElements[i].parentElement;
                const id = fileDownloadInputsElements[i].id;
                result[id] = new FileDownload(container);
            }

            return result;
        }

        let fileUploadsCache: FileUploadsCache;
        let fileDownloadsCache: FileDownloadsCache;

        export function getFileUploadById(id: string): FileUpload | null {
            Cache.load();
            return fileUploadsCache[id] || null;
        }

        export function getFileDownloadById(id: string): FileDownload | null {
            Cache.load();
            return fileDownloadsCache[id] || null;
        }

        export function load(): void {
            if (typeof fileUploadsCache === "undefined") {
                fileUploadsCache = loadFileUploadsCache();
            }
            if (typeof fileDownloadsCache === "undefined") {
                fileDownloadsCache = loadFileDownloadsCache();
            }
        }
    }

    Helpers.Events.callAfterDOMLoaded(() => {
        Cache.load();
    });

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addDownloadObserver(id: string, observer: FileDownloadObserver): boolean {
        const fileDownload = Cache.getFileDownloadById(id);
        if (fileDownload) {
            fileDownload.observers.push(observer);
            return true;
        }
        return false;
    }

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addUploadObserver(uploadId: string, observer: FileUploadObserver): boolean {
        const fileUpload = Cache.getFileUploadById(uploadId);
        if (fileUpload) {
            fileUpload.observers.push(observer);
            return true;
        }
        return false;
    }

    export function clearFileUpload(id: string): void {
        const fileUpload = Cache.getFileUploadById(id);
        fileUpload.clear();
    }
}

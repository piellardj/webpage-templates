namespace Page.FileControl {
    export type FileDownloadObserver = () => unknown;
    export type FileUploadObserver = (files: FileList) => unknown;

    class FileUpload {
        private readonly inputElement: HTMLInputElement;
        private readonly labelSpanElement: HTMLElement;
        public readonly id: string;

        public readonly observers: FileUploadObserver[] = [];

        public constructor(container: HTMLElement) {
            this.inputElement = container.querySelector("input");
            this.labelSpanElement = container.querySelector("label > span");
            this.id = this.inputElement.id;

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
            this.labelSpanElement.innerText = this.labelSpanElement.dataset["placeholder"];
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
        public readonly id: string;

        public readonly observers: FileDownloadObserver[] = [];

        public constructor(container: HTMLElement) {
            this.buttonElement = container.querySelector("input");
            this.id = this.buttonElement.id;

            this.buttonElement.addEventListener("click", (event: Event) => {
                event.stopPropagation();
                for (const observer of this.observers) {
                    observer();
                }
            }, false);
        }
    }

    const fileUploadsCache = new Page.Helpers.Cache<FileUpload>("FileUpload", () => {
        const fileUploadsList: FileUpload[] = [];
        const selector = ".file-control.upload > input[id]";
        const fileUploadInputsElements = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
        for (let i = 0; i < fileUploadInputsElements.length; i++) {
            const container = fileUploadInputsElements[i].parentElement;
            const fileUpload = new FileUpload(container);
            fileUploadsList.push(fileUpload);
        }
        return fileUploadsList;
    });
    const fileDownloadsCache = new Page.Helpers.Cache<FileDownload>("FileDownload", () => {
        const fileDownloadsList: FileDownload[] = [];
        const selector = ".file-control.download > input[id]";
        const fileDownloadInputsElements = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
        for (let i = 0; i < fileDownloadInputsElements.length; i++) {
            const container = fileDownloadInputsElements[i].parentElement;
            const fileDownload = new FileDownload(container);
            fileDownloadsList.push(fileDownload);
        }
        return fileDownloadsList;
    });

    Helpers.Events.callAfterDOMLoaded(() => {
        fileUploadsCache.load();
        fileUploadsCache.load();
    });

    export function addDownloadObserver(id: string, observer: FileDownloadObserver): void {
        const fileDownload = fileDownloadsCache.getById(id);
        fileDownload.observers.push(observer);
    }

    export function addUploadObserver(id: string, observer: FileUploadObserver): void {
        const fileUpload = fileUploadsCache.getById(id);
        fileUpload.observers.push(observer);
    }

    export function clearFileUpload(id: string): void {
        const fileUpload = fileUploadsCache.getById(id);
        fileUpload.clear();
    }
}

namespace Page.FileControl {
    export type FileDownloadObserver = () => unknown;
    export type FileUploadObserver = (files: FileList) => unknown;

    class FileUpload {
        private readonly inputElement: HTMLInputElement;
        private readonly labelSpanElement: HTMLElement;
        public readonly id: string;

        public readonly observers: FileUploadObserver[] = [];

        public constructor(container: HTMLElement) {
            this.inputElement = Page.Helpers.Utils.selector(container, "input");
            this.labelSpanElement = Page.Helpers.Utils.selector(container, "label > span");
            this.id = this.inputElement.id;

            this.inputElement.addEventListener("change", (event: Event) => {
                event.stopPropagation();
                const files = this.inputElement.files;
                if (files && files.length === 1) {
                    this.labelSpanElement.innerText = FileUpload.truncate(files[0]!.name);

                    for (const observer of this.observers) {
                        observer(files);
                    }
                }
            }, false);
        }

        public clear(): void {
            this.inputElement.value = "";
            this.labelSpanElement.innerText = this.labelSpanElement.dataset["placeholder"] || "Upload";
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
            this.buttonElement = Page.Helpers.Utils.selector(container, "input");
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
        const selector = ".file-control.upload > input[id]";
        const fileUploadInputsElements = Page.Helpers.Utils.selectorAll<HTMLInputElement>(document, selector);
        return fileUploadInputsElements.map((fileUploadInputsElement: HTMLInputElement) => {
            const container = fileUploadInputsElement.parentElement!;
            const fileUpload = new FileUpload(container);
            return fileUpload;
        });
    });
    const fileDownloadsCache = new Page.Helpers.Cache<FileDownload>("FileDownload", () => {
        const selector = ".file-control.download > input[id]";
        const fileDownloadInputsElements = Page.Helpers.Utils.selectorAll<HTMLInputElement>(document, selector);
        return fileDownloadInputsElements.map((fileDownloadInputsElement: HTMLInputElement) => {
            const container = fileDownloadInputsElement.parentElement!;
            return new FileDownload(container);
        });
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

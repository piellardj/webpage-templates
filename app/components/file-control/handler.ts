// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace FileControl {
    const filenameMaxSize = 16;

    function truncate(name: string): string {
        if (name.length > filenameMaxSize) {
            return name.substring(0, 15) + "..." +
                name.substring(name.length - 15);
        }
        return name;
    }

    function getElementBySelector(selector: string): Element | null {
        const elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find input file '" + selector + "'.");
        }
        return elt;
    }

    function getUploadInputById(id: string): HTMLInputElement | null {
        const selector = "input[type=file][id=" + id + "]";
        return getElementBySelector(selector) as (HTMLInputElement | null);
    }

    function getDownloadLabel(id: string): HTMLLabelElement | null {
        const selector = ".file-control.download > label[id=" + id + "]";
        return getElementBySelector(selector) as (HTMLLabelElement | null);
    }

    /* Bind event so that filename is displayed on upload */
    const labelsSelector = ".file-control.upload > label";
    window.addEventListener("load", function () {
        const labels = document.querySelectorAll(labelsSelector);
        Array.prototype.forEach.call(labels, function (label) {
            const input = getUploadInputById(label.htmlFor);
            if (input) {
                const span = label.querySelector("span");
                input.addEventListener("change", () => {
                    if (input.files.length === 1) {
                        span.innerText = truncate(input.files[0].name);
                    }
                }, false);
            }
        });
    });

    type DownloadObserver = () => unknown;
    type UploadObserver = (files: FileList) => unknown;

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addDownloadObserver(id: string, observer: DownloadObserver): boolean {
        const elt = getDownloadLabel(id);
        if (elt) {
            elt.addEventListener("click", () => {
                event.stopPropagation();
                observer();
            }, false);
            return true;
        }

        return false;
    }

    /**
     * @return {boolean} Whether or not the observer was added
     */
    export function addUploadObserver(uploadId: string, observer: UploadObserver): boolean {
        const input = getUploadInputById(uploadId);
        if (input) {
            input.addEventListener("change", () => {
                event.stopPropagation();
                if (input.files.length === 1) {
                    observer(input.files);
                }
            }, false);
            return true;
        }

        return false;
    }
}

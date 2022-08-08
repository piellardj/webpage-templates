namespace Page.Demopage {
    const errorsBlockId = "error-messages";
    const errorsBlock = document.getElementById(errorsBlockId);
    if (!errorsBlock) {
        throw new Error("Cannot find element '" + errorsBlockId + "'.");
    }

    function getErrorById(id: string): Element | null {
        if (errorsBlock) {
            return errorsBlock.querySelector("span[id=error-message-" + id + "]");
        }
        return null;
    }

    export function setErrorMessage(id: string, message: string): void {
        if (errorsBlock) {
            const existingSpan = getErrorById(id);
            if (existingSpan) {
                existingSpan.innerHTML = message;
                return;
            } else {
                const newSpan = document.createElement("span");
                newSpan.id = "error-message-" + id;
                newSpan.innerText = message;
                errorsBlock.appendChild(newSpan);
                errorsBlock.appendChild(document.createElement("br"));
            }
        }
    }

    export function removeErrorMessage(id: string): void {
        if (errorsBlock) {
            const span = getErrorById(id);
            if (span) {
                const br = span.nextElementSibling;
                if (br) {
                    errorsBlock.removeChild(br);
                }
                errorsBlock.removeChild(span);
            }
        }
    }
}

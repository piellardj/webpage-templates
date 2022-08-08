/// <reference path="../helpers.ts"/>

namespace Page.Select {
    export type SelectObserver = (selectedValue: string | null) => unknown;

    class Select {
        public readonly id: string;
        public observers: SelectObserver[] = [];

        private static readonly EXPANDED_CLASS: string = "expanded";

        private readonly containerElement: HTMLElement;
        private readonly currentValueElement: HTMLElement;
        private readonly valuesListElement: HTMLElement;
        private readonly valueElements: HTMLElement[];

        private readonly placeholder: string;

        private currentValue: string | null;

        public constructor(container: HTMLElement) {
            this.id = container.id;

            this.containerElement = container;
            this.currentValueElement = Page.Helpers.Utils.selector(container, ".select-current-value");
            this.valuesListElement = Page.Helpers.Utils.selector(container, ".select-values-list");
            this.placeholder = this.valuesListElement.dataset["placeholder"] || "";
            this.currentValue = this.currentValueElement.dataset["value"] || null;

            this.valueElements = [];
            const elements = this.valuesListElement.querySelectorAll(".select-value[data-value]");
            for (let i = 0; i < elements.length; i++) {
                this.valueElements.push(elements[i] as HTMLElement);
            }

            this.containerElement.style.width = `${this.computeMinimumWidth()}px`;

            document.addEventListener("click", (event) => {
                const clickedElement = event.target as HTMLElement;
                const isExpanded = this.containerElement.classList.contains(Select.EXPANDED_CLASS);

                if (isExpanded) {
                    const clickedOnValuesList = this.valuesListElement.contains(clickedElement);

                    if (clickedOnValuesList) {
                        for (const valueElement of this.valueElements) {
                            if (valueElement.contains(clickedElement)) {
                                this.currentValue = valueElement.dataset["value"] || null;
                                this.currentValueElement.dataset["value"] = this.currentValue || undefined;
                                this.currentValueElement.textContent = valueElement.textContent;
                                selectStorage.storeState(this);
                                this.callObservers();
                            }
                        }
                    }
                    this.containerElement.classList.remove(Select.EXPANDED_CLASS);
                } else {
                    const clickedOnCurrentValue = this.currentValueElement.contains(clickedElement);
                    if (clickedOnCurrentValue) {
                        this.containerElement.classList.add(Select.EXPANDED_CLASS);
                    }
                }
            });
        }

        public get value(): string | null {
            return this.currentValue || null;
        }
        public set value(v: string | null) {
            if (v === null) {
                this.currentValueElement.removeAttribute("data-value");
                this.currentValueElement.textContent = this.placeholder;
                this.currentValue = null;
            } else {
                for (const valueElement of this.valueElements) {
                    const valueFromHtml = valueElement.dataset["value"];
                    if (valueFromHtml === v) {
                        this.currentValue = valueFromHtml;
                        this.currentValueElement.dataset["value"] = valueFromHtml;
                        this.currentValueElement.textContent = valueElement.textContent;
                        return;
                    }
                }

                console.log(`No "${v}" value for "${this.id}" select.`);
            }
        }

        public callObservers(): void {
            for (const observer of this.observers) {
                observer(this.value);
            }
        }

        private computeMinimumWidth(): number {
            let result = 0;

            this.valuesListElement.style.opacity = "0";
            this.valuesListElement.style.width = "auto";
            this.valuesListElement.style.fontWeight = "bold";
            this.valuesListElement.style.display = "block";

            const placeholderValue = document.createElement("div");
            placeholderValue.classList.add("select-value");
            placeholderValue.textContent = this.placeholder;
            this.valuesListElement.appendChild(placeholderValue);

            const parentNode = this.containerElement.parentNode;
            if (!parentNode) {
                throw new Error("Select in not attached");
            }
            const nextSiblingNode = this.containerElement.nextSibling;
            parentNode.removeChild(this.containerElement);
            document.body.appendChild(this.containerElement);

            result = this.valuesListElement.getBoundingClientRect().width;

            document.body.removeChild(this.containerElement);
            parentNode.insertBefore(this.containerElement, nextSiblingNode);

            this.valuesListElement.removeChild(placeholderValue);

            this.valuesListElement.style.display = "";
            this.valuesListElement.style.fontWeight = "";
            this.valuesListElement.style.width = "";
            this.valuesListElement.style.opacity = "";

            const MARGIN = 30;
            return result + MARGIN;
        }
    }

    const selectsCache = new Page.Helpers.Cache<Select>("Select", () => {
        const containerElements = Page.Helpers.Utils.selectorAll(document, ".select-container[id]");
        return containerElements.map((containerElement: HTMLElement) => {
            return new Select(containerElement);
        });
    });

    const selectStorage = new Page.Helpers.Storage<Select>("select",
        (select: Select) => {
            return select.value;
        },
        (id: string, serializedValue: string) => {
            const select = selectsCache.getByIdSafe(id);
            if (select) {
                select.value = serializedValue;
                select.callObservers();
                return true;
            }
            return false;
        });

    Helpers.Events.callAfterDOMLoaded(() => {
        selectsCache.load();
        selectStorage.applyStoredState();
    });

    export function addObserver(id: string, observer: SelectObserver): void {
        const select = selectsCache.getById(id);
        select.observers.push(observer);
    }

    export function getValue(id: string): string | null {
        const select = selectsCache.getById(id);
        return select.value;
    }

    export function setValue(id: string, value: string | null): void {
        const select = selectsCache.getById(id);
        select.value = value;
    }

    export function storeState(id: string): void {
        const select = selectsCache.getById(id);
        selectStorage.storeState(select);
    }
    export function clearStoredState(id: string): void {
        const select = selectsCache.getById(id);
        selectStorage.clearStoredState(select);
    }
}

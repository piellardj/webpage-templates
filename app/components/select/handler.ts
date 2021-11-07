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

        private currentValue: string | undefined;

        public constructor(container: HTMLElement) {
            this.id = container.id;

            this.containerElement = container;
            this.currentValueElement = container.querySelector(".select-current-value");
            this.valuesListElement = container.querySelector(".select-values-list");
            this.placeholder = this.valuesListElement.dataset["placeholder"];
            this.currentValue = this.currentValueElement.dataset["value"];

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
                                this.currentValue = valueElement.dataset["value"];
                                this.currentValueElement.dataset["value"] = this.currentValue;
                                this.currentValueElement.textContent = valueElement.textContent;
                                Storage.storeState(this);
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

    namespace Cache {
        type SelectsCache = { [id: string]: Select };

        function loadCache(): SelectsCache {
            const result: SelectsCache = {};
            const containerElements = document.querySelectorAll(".select-container[id]") as NodeListOf<HTMLElement>;
            for (let i = 0; i < containerElements.length; i++) {
                const select = new Select(containerElements[i]);
                result[select.id] = select;
            }
            return result;
        }

        let selectsCache: SelectsCache;

        export function getSelectById(id: string): Select {
            Cache.load();
            return selectsCache[id] || null;
        }

        export function load(): void {
            if (typeof selectsCache === "undefined") {
                selectsCache = loadCache();
            }
        }
    }

    namespace Storage {
        const PREFIX = "select";

        export function storeState(select: Select): void {
            Page.Helpers.URL.setQueryParameter(PREFIX, select.id, select.value);
        }

        export function clearStoredState(select: Select): void {
            Page.Helpers.URL.removeQueryParameter(PREFIX, select.id);
        }

        export function applyStoredState(): void {
            Page.Helpers.URL.loopOnParameters(PREFIX, (controlId: string, value: string) => {
                const select = Cache.getSelectById(controlId);
                if (!select) {
                    console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                    Page.Helpers.URL.removeQueryParameter(PREFIX, controlId);
                } else {
                    select.value = value;
                    select.callObservers();
                }
            });
        }
    }

    Helpers.Events.callAfterDOMLoaded(() => {
        Cache.load();
        Storage.applyStoredState();
    });

    export function addObserver(id: string, observer: SelectObserver): void {
        const select = Cache.getSelectById(id);
        select.observers.push(observer);
    }

    export function getValue(id: string): string | null {
        const select = Cache.getSelectById(id);
        return select.value;
    }

    export function setValue(id: string, value: string): void {
        const select = Cache.getSelectById(id);
        select.value = value;
    }

    export function storeState(id: string): void {
        const select = Cache.getSelectById(id);
        Storage.storeState(select);
    }
    export function clearStoredState(id: string): void {
        const select = Cache.getSelectById(id);
        Storage.clearStoredState(select);
    }
}

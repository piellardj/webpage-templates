declare namespace Page.Helpers {
    export namespace URL {
        function loopOnParameters(prefix: string, callback: (name: string, value: string) => unknown): void;
        function setQueryParameter(prefix: string, name: string, value: string): void;
        function removeQueryParameter(prefix: string, name: string): void;
    }
    export namespace Events {
        function callAfterDOMLoaded(callback: () => unknown): void;
    }
    type LoadObjectsFunction<T> = () => T[];
    export class Cache<T extends {
        id: string;
    }> {
        private readonly objectsName;
        private readonly loadObjectsFunction;
        private cacheObject;
        constructor(objectsName: string, loadObjectsFunction: LoadObjectsFunction<T>);
        /** @throws An Error if the ID is unknown */
        getById(id: string): T;
        /** @returns null if the ID is unknown */
        getByIdSafe(id: string): T | null;
        load(): void;
        private get safeCacheObject();
        private loadCacheObject;
    }
    export {};
}

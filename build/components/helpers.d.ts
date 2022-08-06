declare namespace Page.Helpers {
    export namespace URL {
        function loopOnParameters(prefix: string, callback: (name: string, value: string) => unknown): void;
        function setQueryParameter(prefix: string, name: string, value: string | null): void;
        function removeQueryParameter(prefix: string, name: string): void;
    }
    export namespace Events {
        function callAfterDOMLoaded(callback: () => unknown): void;
    }
    interface ICacheable {
        id: string;
    }
    type LoadObjectsFunction<T> = () => T[];
    export class Cache<T extends ICacheable> {
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
    interface IStorable {
        id: string;
    }
    export class Storage<T extends IStorable> {
        private readonly prefix;
        private readonly serialize;
        private readonly tryDeserialize;
        constructor(prefix: string, serialize: (control: T) => string | null, tryDeserialize: (controlId: string, serializedValue: string) => boolean);
        storeState(control: T): void;
        clearStoredState(control: T): void;
        applyStoredState(): void;
    }
    export {};
}

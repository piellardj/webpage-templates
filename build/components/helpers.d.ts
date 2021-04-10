declare namespace Page.Helpers {
    namespace URL {
        function loopOnParameters(prefix: string, callback: (name: string, value: string) => unknown): void;
        function setQueryParameter(prefix: string, name: string, value: string): void;
        function removeQueryParameter(prefix: string, name: string): void;
    }
    namespace Events {
        function callAfterDOMLoaded(callback: () => unknown): void;
    }
}

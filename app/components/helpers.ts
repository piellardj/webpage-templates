// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Page.Helpers {
    export namespace URL {
        const PARAMETERS_PREFIX = "page";

        class URLBuilder {
            private static queryDelimiter = "?";
            private static parameterDelimiter = "&";
            private static keyValueDelimiter = "=";

            private readonly baseUrl: string;
            private readonly queryParameters: {
                [name: string]: string;
            };

            public constructor(url: string) {
                this.queryParameters = {};

                const queryStringDelimiterIndex = url.indexOf(URLBuilder.queryDelimiter);
                if (queryStringDelimiterIndex < 0) {
                    this.baseUrl = url;
                } else {
                    this.baseUrl = url.substring(0, queryStringDelimiterIndex);
                    const queryString = url.substring(queryStringDelimiterIndex + URLBuilder.queryDelimiter.length);

                    const splitParameters = queryString.split(URLBuilder.parameterDelimiter);
                    for (const parameter of splitParameters) {
                        const keyValue = parameter.split(URLBuilder.keyValueDelimiter);
                        if (keyValue.length === 2) {
                            const key = decodeURIComponent(keyValue[0]);
                            const value = decodeURIComponent(keyValue[1]);
                            this.queryParameters[key] = value;
                        } else {
                            console.log("Unable to parse query string parameter '" + parameter + "'.");
                        }
                    }
                }
            }

            public setQueryParameter(name: string, value: string | null): void {
                if (value === null) {
                    delete this.queryParameters[name];
                } else {
                    this.queryParameters[name] = value;
                }
            }

            public loopOnParameters(prefix: string, callback: (name: string, value: string) => unknown): void {
                for (const parameterName of Object.keys(this.queryParameters)) {
                    if (parameterName.indexOf(prefix) === 0 && parameterName.length > prefix.length) {
                        const parameterValue = this.queryParameters[parameterName];

                        const shortParameterName = parameterName.substring(prefix.length);
                        callback(shortParameterName, parameterValue);
                    }
                    
                }
            }

            public buildUrl(): string {
                const parameters: string[] = [];
                for (const parameterName of Object.keys(this.queryParameters)) {
                    const parameterValue = this.queryParameters[parameterName];
                    const encodedName = encodeURIComponent(parameterName);
                    const encodedValue = encodeURIComponent(parameterValue);
                    parameters.push(encodedName + URLBuilder.keyValueDelimiter + encodedValue);
                }

                const queryString = parameters.join(URLBuilder.parameterDelimiter);
                if (queryString) {
                    return this.baseUrl + URLBuilder.queryDelimiter + queryString;
                } else {
                    return this.baseUrl;
                }
            }
        }

        function buildPrefix(...prefixes: string[]): string {
            return prefixes.join(":") + ":";
        }

        function updateUrl(newUrl: string): void {
            window.history.replaceState("", "", newUrl);
        }

        export function loopOnParameters(prefix: string, callback: (name: string, value: string) => unknown): void {
            const urlBuilder = new URLBuilder(window.location.href);
            const fullPrefix = buildPrefix(PARAMETERS_PREFIX, prefix);
            urlBuilder.loopOnParameters(fullPrefix, callback);
        }

        export function setQueryParameter(prefix: string, name: string, value: string): void {
            const urlBuilder = new URLBuilder(window.location.href);
            const fullPrefix = buildPrefix(PARAMETERS_PREFIX, prefix);
            urlBuilder.setQueryParameter(fullPrefix + name, value);
            updateUrl(urlBuilder.buildUrl());
        }

        export function removeQueryParameter(prefix: string, name: string): void {
            const urlBuilder = new URLBuilder(window.location.href);
            const fullPrefix = buildPrefix(PARAMETERS_PREFIX, prefix);
            urlBuilder.setQueryParameter(fullPrefix + name, null);
            updateUrl(urlBuilder.buildUrl());
        }
    }
}

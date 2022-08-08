var Page;
(function (Page) {
    var Helpers;
    (function (Helpers) {
        var Utils;
        (function (Utils) {
            function selectorAll(base, selector) {
                var elements = base.querySelectorAll(selector);
                var result = [];
                for (var i = 0; i < elements.length; i++) {
                    result.push(elements[i]);
                }
                return result;
            }
            Utils.selectorAll = selectorAll;
            /** @throws if no element was found */
            function selector(base, selector) {
                var element = base.querySelector(selector);
                if (!element) {
                    throw new Error("No element matching '".concat(selector, "'."));
                }
                return element;
            }
            Utils.selector = selector;
            function touchArray(touchList) {
                var result = [];
                for (var i = 0; i < touchList.length; i++) {
                    result.push(touchList[i]);
                }
                return result;
            }
            Utils.touchArray = touchArray;
            function findFirst(array, predicate) {
                if (typeof Array.prototype.findIndex === "function") {
                    return array.findIndex(predicate);
                }
                else {
                    for (var i = 0; i < array.length; i++) {
                        if (predicate(array[i])) {
                            return i;
                        }
                    }
                    return -1;
                }
            }
            Utils.findFirst = findFirst;
        })(Utils = Helpers.Utils || (Helpers.Utils = {}));
        var URL;
        (function (URL) {
            var PARAMETERS_PREFIX = "page";
            var URLBuilder = /** @class */ (function () {
                function URLBuilder(url) {
                    this.queryParameters = {};
                    var queryStringDelimiterIndex = url.indexOf(URLBuilder.queryDelimiter);
                    if (queryStringDelimiterIndex < 0) {
                        this.baseUrl = url;
                    }
                    else {
                        this.baseUrl = url.substring(0, queryStringDelimiterIndex);
                        var queryString = url.substring(queryStringDelimiterIndex + URLBuilder.queryDelimiter.length);
                        var splitParameters = queryString.split(URLBuilder.parameterDelimiter);
                        for (var _i = 0, splitParameters_1 = splitParameters; _i < splitParameters_1.length; _i++) {
                            var parameter = splitParameters_1[_i];
                            var keyValue = parameter.split(URLBuilder.keyValueDelimiter);
                            if (keyValue.length === 2) {
                                var key = decodeURIComponent(keyValue[0]);
                                var value = decodeURIComponent(keyValue[1]);
                                this.queryParameters[key] = value;
                            }
                            else {
                                console.log("Unable to parse query string parameter '" + parameter + "'.");
                            }
                        }
                    }
                }
                URLBuilder.prototype.setQueryParameter = function (name, value) {
                    if (value === null) {
                        delete this.queryParameters[name];
                    }
                    else {
                        this.queryParameters[name] = value;
                    }
                };
                URLBuilder.prototype.loopOnParameters = function (prefix, callback) {
                    for (var _i = 0, _a = Object.keys(this.queryParameters); _i < _a.length; _i++) {
                        var parameterName = _a[_i];
                        if (parameterName.indexOf(prefix) === 0 && parameterName.length > prefix.length) {
                            var parameterValue = this.queryParameters[parameterName];
                            var shortParameterName = parameterName.substring(prefix.length);
                            callback(shortParameterName, parameterValue);
                        }
                    }
                };
                URLBuilder.prototype.buildUrl = function () {
                    var parameters = [];
                    for (var _i = 0, _a = Object.keys(this.queryParameters); _i < _a.length; _i++) {
                        var parameterName = _a[_i];
                        var parameterValue = this.queryParameters[parameterName];
                        var encodedName = encodeURIComponent(parameterName);
                        var encodedValue = encodeURIComponent(parameterValue);
                        parameters.push(encodedName + URLBuilder.keyValueDelimiter + encodedValue);
                    }
                    var queryString = parameters.join(URLBuilder.parameterDelimiter);
                    if (queryString) {
                        return this.baseUrl + URLBuilder.queryDelimiter + queryString;
                    }
                    else {
                        return this.baseUrl;
                    }
                };
                URLBuilder.queryDelimiter = "?";
                URLBuilder.parameterDelimiter = "&";
                URLBuilder.keyValueDelimiter = "=";
                return URLBuilder;
            }());
            function buildPrefix() {
                var prefixes = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    prefixes[_i] = arguments[_i];
                }
                return prefixes.join(":") + ":";
            }
            function updateUrl(newUrl) {
                window.history.replaceState("", "", newUrl);
            }
            function loopOnParameters(prefix, callback) {
                var urlBuilder = new URLBuilder(window.location.href);
                var fullPrefix = buildPrefix(PARAMETERS_PREFIX, prefix);
                urlBuilder.loopOnParameters(fullPrefix, callback);
            }
            URL.loopOnParameters = loopOnParameters;
            function setQueryParameter(prefix, name, value) {
                var urlBuilder = new URLBuilder(window.location.href);
                var fullPrefix = buildPrefix(PARAMETERS_PREFIX, prefix);
                urlBuilder.setQueryParameter(fullPrefix + name, value);
                updateUrl(urlBuilder.buildUrl());
            }
            URL.setQueryParameter = setQueryParameter;
            function removeQueryParameter(prefix, name) {
                var urlBuilder = new URLBuilder(window.location.href);
                var fullPrefix = buildPrefix(PARAMETERS_PREFIX, prefix);
                urlBuilder.setQueryParameter(fullPrefix + name, null);
                updateUrl(urlBuilder.buildUrl());
            }
            URL.removeQueryParameter = removeQueryParameter;
        })(URL = Helpers.URL || (Helpers.URL = {}));
        var Events;
        (function (Events) {
            function callAfterDOMLoaded(callback) {
                if (document.readyState === "loading") { // Loading hasn't finished yet
                    document.addEventListener("DOMContentLoaded", callback);
                }
                else { // `DOMContentLoaded` has already fired
                    callback();
                }
            }
            Events.callAfterDOMLoaded = callAfterDOMLoaded;
        })(Events = Helpers.Events || (Helpers.Events = {}));
        var Cache = /** @class */ (function () {
            function Cache(objectsName, loadObjectsFunction) {
                this.objectsName = objectsName;
                this.loadObjectsFunction = loadObjectsFunction;
                this.cacheObject = null;
            }
            /** @throws An Error if the ID is unknown */
            Cache.prototype.getById = function (id) {
                var object = this.safeCacheObject[id];
                if (!object) {
                    throw new Error("Invalid '".concat(this.objectsName, "' cache object id '").concat(id, "'."));
                }
                return object;
            };
            /** @returns null if the ID is unknown */
            Cache.prototype.getByIdSafe = function (id) {
                return this.safeCacheObject[id] || null;
            };
            Cache.prototype.load = function () {
                if (!this.cacheObject) {
                    this.cacheObject = this.loadCacheObject();
                }
            };
            Object.defineProperty(Cache.prototype, "safeCacheObject", {
                get: function () {
                    if (!this.cacheObject) {
                        this.load();
                    }
                    return this.cacheObject;
                },
                enumerable: false,
                configurable: true
            });
            Cache.prototype.loadCacheObject = function () {
                var index = {};
                var objects = this.loadObjectsFunction();
                for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                    var object = objects_1[_i];
                    if (typeof index[object.id] !== "undefined") {
                        throw new Error("Object '".concat(object.id, "' is already in cache."));
                    }
                    index[object.id] = object;
                }
                return index;
            };
            return Cache;
        }());
        Helpers.Cache = Cache;
        var Storage = /** @class */ (function () {
            function Storage(prefix, serialize, tryDeserialize) {
                this.prefix = prefix;
                this.serialize = serialize;
                this.tryDeserialize = tryDeserialize;
            }
            Storage.prototype.storeState = function (control) {
                var valueAsString = this.serialize(control);
                Page.Helpers.URL.setQueryParameter(this.prefix, control.id, valueAsString);
            };
            Storage.prototype.clearStoredState = function (control) {
                Page.Helpers.URL.removeQueryParameter(this.prefix, control.id);
            };
            Storage.prototype.applyStoredState = function () {
                var _this = this;
                Page.Helpers.URL.loopOnParameters(this.prefix, function (controlId, value) {
                    if (!_this.tryDeserialize(controlId, value)) {
                        console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(_this.prefix, controlId);
                    }
                });
            };
            return Storage;
        }());
        Helpers.Storage = Storage;
    })(Helpers = Page.Helpers || (Page.Helpers = {}));
})(Page || (Page = {}));

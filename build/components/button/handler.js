var Page;
(function (Page) {
    var Button;
    (function (Button_1) {
        var Button = /** @class */ (function () {
            function Button(element) {
                var _this = this;
                this.observers = [];
                this.id = element.id;
                this.element = element;
                this.element.addEventListener("click", function (event) {
                    event.stopPropagation();
                    for (var _i = 0, _a = _this.observers; _i < _a.length; _i++) {
                        var observer = _a[_i];
                        observer();
                    }
                }, false);
            }
            Object.defineProperty(Button.prototype, "label", {
                set: function (newLabel) {
                    this.element.innerText = newLabel;
                },
                enumerable: false,
                configurable: true
            });
            return Button;
        }());
        var Cache;
        (function (Cache) {
            function loadCache() {
                var result = {};
                var elements = document.querySelectorAll("button[id]");
                for (var i = 0; i < elements.length; i++) {
                    var button = new Button(elements[i]);
                    result[button.id] = button;
                }
                return result;
            }
            var buttonsCache;
            function getButtonById(id) {
                if (typeof buttonsCache === "undefined") {
                    buttonsCache = loadCache();
                }
                return buttonsCache[id] || null;
            }
            Cache.getButtonById = getButtonById;
        })(Cache || (Cache = {}));
        /**
         * @return {boolean} Whether or not the observer was added
         */
        function addObserver(buttonId, observer) {
            var button = Cache.getButtonById(buttonId);
            if (button) {
                button.observers.push(observer);
                return true;
            }
            return false;
        }
        Button_1.addObserver = addObserver;
        function setLabel(buttonId, label) {
            var button = Cache.getButtonById(buttonId);
            if (button) {
                button.label = label;
            }
        }
        Button_1.setLabel = setLabel;
    })(Button = Page.Button || (Page.Button = {}));
})(Page || (Page = {}));

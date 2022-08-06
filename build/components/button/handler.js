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
        var buttonsCache = new Page.Helpers.Cache("Button", function () {
            var buttonsList = [];
            var elements = document.querySelectorAll("button[id]");
            for (var i = 0; i < elements.length; i++) {
                var button = new Button(elements[i]);
                buttonsList.push(button);
            }
            return buttonsList;
        });
        function addObserver(buttonId, observer) {
            var button = buttonsCache.getById(buttonId);
            button.observers.push(observer);
        }
        Button_1.addObserver = addObserver;
        function setLabel(buttonId, label) {
            var button = buttonsCache.getById(buttonId);
            button.label = label;
        }
        Button_1.setLabel = setLabel;
    })(Button = Page.Button || (Page.Button = {}));
})(Page || (Page = {}));

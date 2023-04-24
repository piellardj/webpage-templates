var Page;
(function (Page) {
    var Homepage;
    (function (Homepage) {
        var Card;
        (function (Card) {
            function bindCardsActiveEvent() {
                var _a;
                var allCardFrames = document.querySelectorAll(".card-frame");
                var ACTIVE_CLASS = "active";
                document.addEventListener("click", function (event) {
                    var _a;
                    for (var i = 0; i < allCardFrames.length; i++) {
                        var cardFrame = allCardFrames[i];
                        cardFrame.classList.remove(ACTIVE_CLASS);
                    }
                    var target = event.target;
                    var current = target;
                    while (current) {
                        if (current.classList.contains("card-frame")) {
                            current.classList.add(ACTIVE_CLASS);
                            break;
                        }
                        else if (current.classList.contains("card-title")) {
                            (_a = current === null || current === void 0 ? void 0 : current.nextElementSibling) === null || _a === void 0 ? void 0 : _a.classList.add(ACTIVE_CLASS);
                        }
                        current = current.parentElement;
                    }
                });
                var _loop_1 = function (i) {
                    var cardFrame = allCardFrames[i];
                    cardFrame.addEventListener("mouseleave", function () {
                        cardFrame.classList.remove(ACTIVE_CLASS);
                    });
                    (_a = cardFrame.parentElement) === null || _a === void 0 ? void 0 : _a.addEventListener("mouseleave", function () {
                        cardFrame.classList.remove(ACTIVE_CLASS);
                    });
                };
                for (var i = 0; i < allCardFrames.length; i++) {
                    _loop_1(i);
                }
            }
            bindCardsActiveEvent();
        })(Card = Homepage.Card || (Homepage.Card = {}));
    })(Homepage = Page.Homepage || (Page.Homepage = {}));
})(Page || (Page = {}));

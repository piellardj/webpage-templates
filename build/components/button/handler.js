var Button;
(function (Button) {
    function getButtonById(id) {
        var selector = "button[id=" + id + "]";
        var elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find button '" + id + "'.");
        }
        return elt;
    }
    /**
     * @return {boolean} Whether or not the observer was added
     */
    function addObserver(buttonId, observer) {
        var elt = getButtonById(buttonId);
        if (elt) {
            elt.addEventListener("click", function (event) {
                event.stopPropagation();
                observer();
            }, false);
            return true;
        }
        return false;
    }
    Button.addObserver = addObserver;
    function setLabel(buttonId, label) {
        var elt = getButtonById(buttonId);
        if (elt) {
            elt.innerText = label;
        }
    }
    Button.setLabel = setLabel;
})(Button || (Button = {}));

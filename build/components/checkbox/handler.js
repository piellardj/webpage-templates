// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Checkbox;
(function (Checkbox) {
    function getCheckboxFromId(id) {
        var selector = "input[type=checkbox][id=" + id + "]";
        var elt = document.querySelector(selector);
        if (!elt) {
            console.error("Cannot find checkbox '" + selector + "'.");
        }
        return elt;
    }
    /**
     * @return {boolean} Whether or not the observer was added
     */
    function addObserver(checkboxId, observer) {
        var elt = getCheckboxFromId(checkboxId);
        if (elt) {
            elt.addEventListener("change", function (event) {
                event.stopPropagation();
                observer(elt.checked);
            }, false);
            return true;
        }
        return false;
    }
    Checkbox.addObserver = addObserver;
    function setChecked(checkboxId, value) {
        var elt = getCheckboxFromId(checkboxId);
        if (elt) {
            elt.checked = value ? true : false;
        }
    }
    Checkbox.setChecked = setChecked;
    function isChecked(checkboxId) {
        var elt = getCheckboxFromId(checkboxId);
        return !!elt && elt.checked;
    }
    Checkbox.isChecked = isChecked;
})(Checkbox || (Checkbox = {}));

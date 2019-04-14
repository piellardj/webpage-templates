/* exported Picker */
const Picker = (function() {
    const pickersDictionary = {};

    /**
     * Populates pickers dictionary and binds events.
     */
    function buildPickersDictionary() {
        const pickers = document.querySelectorAll(".inline-picker");
        for (let i = 0; i < pickers.length; ++i) {
            const picker = {
                wrapper: pickers[i],
                leftButton: pickers[i].querySelector(".picker-button.left"),
                rightButton: pickers[i].querySelector(".picker-button.right"),
                span: pickers[i].querySelector("span"),
                inputs: pickers[i].querySelectorAll("input"),
                observers: [],
            };

            bindPickerEvents(picker);
            pickersDictionary[pickers[i].id] = picker;
        }
    }

    /**
     * @param {object} picker
     * @return {number}
     */
    function getIndexOfCheckedInput(picker) {
        for (let i = 0; i < picker.inputs.length; ++i) {
            if (picker.inputs[i].checked) {
                return i;
            }
        }
        return -1;
    }

    /**
     * @param {object} button
     * @param {boolean} enable
     */
    function enableButton(button, enable) {
        if (enable) {
            button.classList.remove("disabled");
        } else if (!button.classList.contains("disabled")) {
            button.classList.add("disabled");
        }
    }

    /**
     *  Updates selector text and disables/enables buttons if needed.
     *  @param {object} picker
     */
    function updateVisibleValue(picker) {
        const index = getIndexOfCheckedInput(picker);
        let selectedLabel;
        let selectedValue = null;
        if (index >= 0) {
            selectedLabel = picker.inputs[index].dataset.label;
            selectedValue = picker.inputs[index].value;
        } else {
            selectedLabel = picker.wrapper.dataset.placeholder || "";
        }

        picker.span.innerText = selectedLabel;

        if (picker.inputs.length < 0) {
            enableButton(picker.leftButton, false);
            enableButton(picker.rightButton, false);
        } else {
            enableButton(picker.leftButton, !picker.inputs[0].checked);
            enableButton(picker.rightButton,
                !picker.inputs[picker.inputs.length - 1].checked);
        }

        for (let i = 0; i < picker.observers.length; ++i) {
            picker.observers[i](selectedValue);
        }
    }

    /**
     * @param {object} button
     * @return {boolean}
     */
    function isButtonEnabled(button) {
        return !button.classList.contains("disabled");
    }

    /**
     * @param {object} picker HtmlObjectElement
     */
    function bindPickerEvents(picker) {
        picker.leftButton.addEventListener("click", function() {
            if (isButtonEnabled(picker.leftButton)) {
                const index = getIndexOfCheckedInput(picker);
                if (index < 0) {
                    picker.inputs[picker.inputs.length-1].checked = true;
                } else if (index > 0) {
                    picker.inputs[index].checked = false;
                    picker.inputs[index - 1].checked = true;
                }

                updateVisibleValue(picker);
            }
        });

        picker.rightButton.addEventListener("click", function() {
            if (isButtonEnabled(picker.rightButton)) {
                const index = getIndexOfCheckedInput(picker);
                if (index < 0) {
                    picker.inputs[0].checked = true;
                } else if (index < picker.inputs.length - 1) {
                    picker.inputs[index].checked = false;
                    picker.inputs[index + 1].checked = true;
                }

                updateVisibleValue(picker);
            }
        });

        updateVisibleValue(picker);
    }

    window.addEventListener("load", buildPickersDictionary);

    return Object.freeze({
        /**
         * Callback will be called every time the value changes.
         * @param {string} id
         * @param {Object} observer Callback method
         */
        addObserver: function(id, observer) {
            pickersDictionary[id].observers.push(observer);
        },

        /**
         * @param {string} id
         * @return {string}
         */
        getValue: function(id) {
            const picker = pickersDictionary[id];
            const index = getIndexOfCheckedInput(picker);
            if (index >= 0) {
                return picker.inputs[index].value;
            }
            return null;
        },

        /**
         * @param {string} id
         * @param {string} value
         */
        setValue: function(id, value) {
            const picker = pickersDictionary[id];
            for (let i = 0; i < picker.inputs.length; ++i) {
                picker.inputs[i].checked = (picker.inputs[i].value === value);
            }
            updateVisibleValue(picker);
        },
    });
})();

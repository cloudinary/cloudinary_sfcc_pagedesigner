(() => {
    subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
        const groupName = config.groupName;
        if (typeof value === 'object' && value !== null) {
            value.value = 'Custom';
        }
        let val = (value && value.value) ? value.value : config.defaultVal;
        let labels = Object.keys(config.options);
        let radioGroup = formsEls.htmlToElement(formsEls.getRadioGroup(config.label, value, labels, groupName));
        var clone = document.importNode(radioGroup, true);
        document.body.appendChild(clone);
        let group = document.getElementsByName(groupName);
        Array.prototype.forEach.call(group, radio => {
            if (radio.value === val) {
                radio.checked = true;
            }
            radio.addEventListener('click', () => {
                let action = config.options[radio.value];
                if (action !== 'emit') {
                    let act = formsEls[action];
                    act('image');
                } else {
                    let val = document.querySelector('input[name=' + groupName + ']:checked').value;
                    emit({
                        type: 'sfcc:value',
                        payload: { value: val }
                    })
                }
            })
        });
    });

})()
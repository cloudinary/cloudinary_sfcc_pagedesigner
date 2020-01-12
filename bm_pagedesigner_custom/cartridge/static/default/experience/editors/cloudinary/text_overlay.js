subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
    console.log('Text Overlay, sfcc:ready', dataLocale, displayLocale, value, config);
    value = value || {};
    var template = overlayTemplate(value);
    var clone = document.importNode(template.content, true);
    document.body.appendChild(clone);
    var els = [].slice.call(document.getElementsByClassName('text-overlay')[0].getElementsByTagName('input'));
    els = els.concat([].slice.call(document.getElementsByClassName('text-overlay')[0].getElementsByTagName('select')));
    els = els.concat([].slice.call(document.getElementsByClassName('text-overlay')[0].getElementsByTagName('textarea')));
    els.forEach(function (el) {
        el.addEventListener('blur', emitUpdatedValues)
    });
    var pickerEl = document.querySelector('#color-picker');
    var picker = new Picker(
        {
            parent: pickerEl,
            popup: false,
            color: value.color || '#000000',
            onDone: function (color) {
                var colorHolder = document.getElementById('color-holder');
                colorHolder.value = color.hex.replace('#', '');
                emitUpdatedValues();
            }
        }
        );
    picker.show();

});

const emitUpdatedValues = function () {
    var values = {};
    var els = [].slice.call(document.getElementsByClassName('text-overlay')[0].getElementsByTagName('input'));
    els = els.concat([].slice.call(document.getElementsByClassName('text-overlay')[0].getElementsByTagName('select')));
    els = els.concat([].slice.call(document.getElementsByClassName('text-overlay')[0].getElementsByTagName('textarea')));
    els.forEach(function (el) {
        var propName = el.dataset.propname;
        if (el.type === 'checkbox') {
            values[propName] = el.checked;
        } else {
            values[propName] = el.value;
        }
    });
    console.log(values);
    emit({
        type: 'sfcc:value',
        payload: values
    });
}

const overlayTemplate = function (value) {
    const template = document.createElement('template');
    const fontStyles = {
        'none': 'Normal',
        'bold': 'Bold',
        'italic': 'Italic',
        'underline': 'Underline',
        'subscript': 'Subscript',
        'superscript': 'Superscript'
    };
    template.innerHTML = `
    <div class="slds-panel__body text-overlay">
    ${formsEls.getCheckbox('Enable Text Overlay', !!value.enable, 'enable')}
    ${formsEls.getTextArea('Text To Overlay', value.text || '', true, 'text')}
    ${formsEls.getTextField('font Famaly', (value.font || 'Arial'), true, 'font')}
    ${formsEls.getTextField('font size', value.size || '12', true, 'fontSize')}
    ${formsEls.getSelectField('Font Type', fontStyles, false, 'fontStyle', (value.fontStyle || 'normal'))}
    <div id="color-picker"></div>
    <input type="hidden" id="color-holder" data-propName="color" value="${value.color || '#000000'}"></input>
    ${formsEls.getTextField('X position', value.xPos || 0, true, 'xPos')}
    ${formsEls.getTextField('Y position', value.yPos || 0, true, 'yPos')}
    ${formsEls.getTextField('Overlay width', value.width || 'auto', true, 'width')}
    </div>
    `;
    return template;
}
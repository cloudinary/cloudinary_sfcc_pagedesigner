window.formsEls = {
  getCheckbox: function (label, checked, propName, classes) {
    var classesStr = Array.isArray(classes) ? classes.join(' ') : classes || '';
    var checkedStr = checked ? 'checked' : ''
    var id = window.checkboxIdNum + 1 || 1;
    window.checkboxIdNum = id;
    return `
    <div class="slds-form-element">
        <div class="slds-form-element__control">
            <div class="slds-checkbox ${classesStr}">
                <input type="checkbox" name="options" data-propName="${propName}" ${checkedStr} id="checkbox-unique-id-${id}" />
                <label class="slds-checkbox__label" for="checkbox-unique-id-${id}">
                    <span class="slds-checkbox_faux"></span>
                    <span class="slds-form-element__label">${label}</span>
                </label>
        </div>
    </div>
</div>`
  },

  getTextField: function (label, value, required, propName, classes, type = 'text') {
    var requiredStr = required ? '<abbr class="slds-required" title="required">* </abbr>' : '';
    var classesStr = Array.isArray(classes) ? classes.join(' ') : classes || '';
    var id = window.inputIdNum + 1 || 1;
    window.inputIdNum = id;
    return `
    <div class="slds-form-element ${classesStr}">
  <label class="slds-form-element__label" for="text-input-id-${id}">
    ${requiredStr}${label}</label>
  <div class="slds-form-element__control">
    <input type="${type}" id="text-input-id-${id}" data-propName="${propName}" value="${value}" ${required ? 'required' : ''} class="slds-input" />
  </div>
</div>
    `
  },
  getNumberField: function (label, value, required, propName, classes) {
    return getTextField(label, value, required, propName, classes , 'number');
  },
  getSelectField: function (label, options, required, propName, selected, classes) {
    var classesStr = Array.isArray(classes) ? classes.join(' ') : classes || '';
    var requiredStr = required ? '<abbr class="slds-required" title="required">* </abbr>' : '';
    var id = window.selectIdNum + 1 || 1;
    window.selectIdNum = id;
    var optionsStr = '';
    var optionsKeys = Object.keys(options);
    optionsKeys.forEach(function (op) {
      if (op === selected) {
        optionsStr += '<option value="' + op + '" selected="selected">' + options[op] + '</option>'
      } else {
        optionsStr += '<option value="' + op + '">' + options[op] + '</option>'
      }
    })

    return `
    <div class="slds-form-element ${classesStr}">
  <label class="slds-form-element__label" for="select-${id}">
    ${requiredStr}${label}</label>
  <div class="slds-form-element__control">
    <div class="slds-select_container">
      <select class="slds-select" id="select-${id}" data-propName="${propName}" ${required ? 'required' : ''}>
        <option value="">Please select</option>
        ${optionsStr}
      </select>
    </div>
  </div>
</div>
    `
  },
  getButton: function (label, classes) {
    var classesStr = Array.isArray(classes) ? classes.join(' ') : classes || '';
    return `<button class="slds-button slds-button_neutral">${label}</button>`
  },
  getTextArea: function (label, value, required, propName, classes) {
    var classesStr = Array.isArray(classes) ? classes.join(' ') : classes || '';
    var requiredStr = required ? '<abbr class="slds-required" title="required">* </abbr>' : '';
    var id = window.textareaIdNum + 1 || 1;
    window.textareaIdNum = id;
    return `
        <div class="slds-form-element">
  <label class="slds-form-element__label" for="textarea-id-${id}">
    ${requiredStr}${label}</label>
  <div class="slds-form-element__control">
    <textarea id="textarea-id-${id}" ${required ? 'required' : ''} data-propName="${propName}" class="slds-textarea">${value}</textarea>
  </div>
</div>
        `
  },
  getErrorToast: function (errorText) {
    return `
<div class="slds-notify_container slds-is-absolute cld-error">
<div class="slds-notify slds-notify_toast slds-theme_error" role="status">
<span class="slds-assistive-text">error</span>
<span class="slds-icon_container slds-icon-utility-error slds-m-right_small slds-no-flex slds-align-top" title="Error">
<svg class="slds-icon slds-icon_small" aria-hidden="true"
xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="error"><path d="M12 .9C5.9.9.9 5.9.9 12s5 11.1 11.1 11.1 11.1-5 11.1-11.1S18.1.9 12 .9zM3.7 12c0-4.6 3.7-8.3 8.3-8.3 1.8 0 3.5.5 4.8 1.5L5.2 16.8c-1-1.3-1.5-3-1.5-4.8zm8.3 8.3c-1.8 0-3.5-.5-4.8-1.5L18.8 7.2c1 1.3 1.5 3 1.5 4.8 0 4.6-3.7 8.3-8.3 8.3z"/>
</svg>
</span>
<div class="slds-notify__content">
<h2 class="slds-text-heading_small ">${errorText}</h2>
</div>
<div class="slds-notify__close">
<button class="slds-button slds-button_icon slds-button_icon-inverse" id="btn-close" title="Close">
<svg class="slds-button__icon slds-button__icon_large" aria-hidden="true"
xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="close"><path d="M14.3 11.7l6-6c.3-.3.3-.7 0-1l-.9-1c-.3-.2-.7-.2-1 0l-6 6.1c-.2.2-.5.2-.7 0l-6-6.1c-.3-.3-.7-.3-1 0l-1 1c-.2.2-.2.7 0 .9l6.1 6.1c.2.2.2.4 0 .6l-6.1 6.1c-.3.3-.3.7 0 1l1 1c.2.2.7.2.9 0l6.1-6.1c.2-.2.4-.2.6 0l6.1 6.1c.2.2.7.2.9 0l1-1c.3-.3.3-.7 0-1l-6-6c-.2-.2-.2-.5 0-.7z"/>
</svg>
<span class="slds-assistive-text">Close</span>
</button>
</div>
</div>
</div>
    `
  },
  getSlider: function (label, value, min, max, classes) {
    var classesStr = Array.isArray(classes) ? classes.join(' ') : classes || '';
    var id = window.sliderIdNum + 1 || 1;
    window.sliderIdNum = id;
    return `<div class="slds-form-element ${classesStr}">
      <label class="slds-form-element__label" for="slider-id-${id}">
      <span class="slds-slider-label">
      <span class="slds-slider-label__label">${label}</span>
      <span class="slds-slider-label__range">${min} - ${max}</span>
      </span>
      </label>
      <div class="slds-form-element__control">
      <div class="slds-slider">
      <input type="range" id="slider-id-${id}" class="slds-slider__range" value="${value}" />
      <span class="slds-slider__value" aria-hidden="true">${value}</span>
      </div>
      </div>
      </div>`

  },
  getRadioGroup: function (label, value, options, groupName, classes) {
    return `
    <fieldset class="slds-form-element">
  <legend class="slds-form-element__legend slds-form-element__label">${label}</legend>
  <div class="slds-form-element__control">
    <div class="slds-radio_button-group">
    ${options.map((option, i) =>
      `<span class="slds-button slds-radio_button">
      <input type="radio" name="${groupName}" id="${option}-${i}" value="${option}" />
      <label class="slds-radio_button__label" for="${option}-${i}">
        <span class="slds-radio_faux">${option}</span>
      </label>
    </span>`).join('')}
    </div>
  </div>
</fieldset>
    `;

  },
  getMlTrigger: function (fileType, classes) {
    return `
    <div class="slds-form-element">
<span class="slds-form-element__label" id="file-selector-primary-label">Choose ${fileType}</span>
<div class="slds-form-element__control">
<div class="slds-file-selector slds-file-selector_files">
<div class="slds-file-selector__dropzone">
<label class="slds-file-selector__body" for="file-upload-input-01" id="file-selector-secondary-label">
<span class="slds-file-selector__button slds-button slds-button_neutral">
<svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" viewBox="0 0 24 24"><path d="M21.2 6.5H10.8c-.7 0-1.3-.4-1.7-1L7.5 2.8c-.3-.6-.9-1-1.6-1H2.8c-1 0-1.9.9-1.9 1.9v16.6c0 1 .9 1.9 1.9 1.9h18.4c1 0 1.9-.9 1.9-1.9v-12c0-1-.9-1.8-1.9-1.8zm0-3.7H10.1c-.2 0-.3.2-.2.3l.8 1.2c.1.2.2.3.4.3h10.1c.5 0 1 .1 1.5.3.1.1.4-.1.4-.3 0-1-.9-1.8-1.9-1.8z"></path>
            </svg>Choose ${fileType}</span>
</label>
</div>
</div>
</div>
</div>
    `
  },
  htmlToElement: function (html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  },
  getTextFieldNode: function(htmlOpts, onBlur, onClick) {
    let label, value, required, propName, classes = {htmlOpts};
    let node = formsEls.htmlToElement(formsEls.getTextField(label, value, required, propName, classes));
    if (onBlur) {
      node.querySelector('input').addEventListener('blur', onBlur);
    }
    if (onClick) {
      node.querySelector('input').addEventListener('click', onClick);
    }
  },
  getNumberFieldNode: function(htmlOpts, onBlur, onClick) {
    let label, value, required, propName, classes = htmlOpts;
    let node = formsEls.htmlToElement(formsEls.getNumberField(label, value, required, propName, classes));
    if (onBlur) {
      node.querySelector('input').addEventListener('blur', onBlur);
    }
    if (onClick) {
      node.querySelector('input').addEventListener('click', onClick);
    }
  },
  getButtonNode: function(htmlOpts, onBlur, onClick) {
    let label, classes = htmlOpts;
    let node = formsEls.htmlToElement(formsEls.getButton(label, classes));
    if (onBlur) {
      node.querySelector('button').addEventListener('blur', onBlur);
    }
    if (onClick) {
      node.querySelector('button').addEventListener('click', onClick);
    }
  },
  openMl: function (type) {
    emit({
      type: 'sfcc:breakout',
      payload: {
        id: 'breakout',
        title: `Cloudinary ${type}`
      }
    }, formsEls.handleBreakoutClose);
  },
  handleBreakoutClose: function ({ type, value }) {
    if (type === 'sfcc:breakoutApply') {
      emit({
        type: 'sfcc:value',
        payload: value
      });
    }
  }
}


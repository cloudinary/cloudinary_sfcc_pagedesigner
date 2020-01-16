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

  getTextField: function (label, value, required, propName, classes) {
    var requiredStr = required ? '<abbr class="slds-required" title="required">* </abbr>' : '';
    var classesStr = Array.isArray(classes) ? classes.join(' ') : classes || '';
    var id = window.inputIdNum + 1 || 1;
    window.inputIdNum = id;
    return `
    <div class="slds-form-element ${classesStr}">
  <label class="slds-form-element__label" for="text-input-id-${id}">
    ${requiredStr}${label}</label>
  <div class="slds-form-element__control">
    <input type="text" id="text-input-id-${id}" data-propName="${propName}" value="${value}" ${required ? 'required' : ''} class="slds-input" />
  </div>
</div>
    `
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
  htmlToElement: function(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
}


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

  }
}


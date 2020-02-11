var $;

// Create an image URL with formatting options for thumbnails
var imageTransform = function (version, secureUrl, settings, format) {
    var urlArray = secureUrl.split('v' + version); // Remove version number
    urlArray.splice(1, 0, settings); // Inject settings
    var urlString = urlArray.join('');
    urlString = urlString.replace('.' + format, '.jpg');
    return urlString;
};

// Create HTML for a checkbox
var inputCheckbox = function (idname, label, checked) {
    var str = '';
    str += '<div class="video_selector__checkbox">';
    str += '<label class="video_selector__checkbox__label">';
    str += '<input id="' + idname + '" name="' + idname + '" class="video_selector__checkbox__input" type="checkbox"' + (checked ? ' checked' : '') + ' />';
    str += '<span class="video_selector__checkbox__text">' + label + '</span>';
    str += '</label>';
    str += '</div>';

    return str;
};

// Create HTML for a alignment selector
var alignmentSelector = function (idname, label, selectedValue) {
    var alignmentCell = function (value, selectedCellValue) {
        return '<a class="aligner__col' + (value === selectedCellValue ? ' selected' : '') + '" href="#" data-value="' + value + '"></a>';
    };

    /* eslint-disable indent */
    var str = '';
    str += '<div class="slds-form-element__row">';
        str += '<div class="video_selector__alignment slds-m-bottom_x-small" id="' + idname + '">';
            str += '<div class="aligner__label slds-form-element__label">' + label + '</div>';
            str += '<div class="aligner__container slds-size_1-of-1 slds-form-element">';
                str += '<div class="aligner__row">';
                    str += alignmentCell('north_west', selectedValue);
                    str += alignmentCell('north', selectedValue);
                    str += alignmentCell('north_east', selectedValue);
                str += '</div>';
                str += '<div class="aligner__row">';
                    str += alignmentCell('west', selectedValue);
                    str += alignmentCell('center', selectedValue);
                    str += alignmentCell('east', selectedValue);
                str += '</div>';
                str += '<div class="aligner__row">';
                    str += alignmentCell('south_west', selectedValue);
                    str += alignmentCell('south', selectedValue);
                    str += alignmentCell('south_east', selectedValue);
                str += '</div>';
            str += '</div>';
        str += '</div>';
    str += '</div>';
    /* eslint-enable indent */

    return str;
};

// Create HTML for an input field
var inputField = function (idname, label, value) {
    /* eslint-disable indent */
    var str = '';
    str += '<div class="slds-form-element__row">';
        str += '<div class="slds-m-bottom_x-small">';
            str += '<div class="video_selector__input slds-size_1-of-1 slds-form-element">';

                str += '<label class="video_selector__input__label slds-form-element__label" for="' + idname + '">';
                    str += label;
                str += '</label>';

                str += '<div class="slds-form-element__control">';
                    str += '<input id="' + idname + '" name="' + idname + '" value="' + value + '" class="video_selector__input__input slds-input" type="text" />';
                str += '</div>';

            str += '</div>';
        str += '</div>';
    str += '</div>';
    /* eslint-enable indent */

    return str;
};

var overlaySelectorTemplate = function (optionArray, selectedOverlayId, checkedOverlay, valueOpacity, valueWidth, valuePosition) {
    var template = document.createElement('template');
    var str = '';
    var selected = '';
    var url;

    /* eslint-disable indent */
    str += '<div class="video_selector__options">';
        str += inputCheckbox('video_options_overlay_enable', 'Enable Overlay', checkedOverlay);
    str += '</div>';

    str += '<div class="video_selector__options_reveal' + (checkedOverlay ? ' checked' : '') + '">';
        str += '<div class="video_selector__container">';
        for (var i = 0; i < optionArray.length; i++) {
            selected = '';
            if (selectedOverlayId === optionArray[i].public_id) {
                selected = ' selected';
            }
            str += '<div class="video_selector__item' + selected + '" data-value="' + optionArray[i].public_id + '">';
            url = imageTransform(optionArray[i].version, optionArray[i].secure_url, 'c_lpad,h_50,w_50', optionArray[i].format);

            str += '<div class="video_selector__image">';
                str += '<img src="' + url + '" />';
            str += '</div>';

            str += '<div class="video_selector__data">';
                str += '<span class="video_selector__data__id">' + optionArray[i].public_id + '</span><br />';
                str += '<span class="video_selector__data__type">' + optionArray[i].resource_type + '</span> - ';
                str += '<span class="video_selector__data__format">' + optionArray[i].format + '</span> - ';
                str += '<span class="video_selector__data__size">(' + optionArray[i].width + ' x ' + optionArray[i].height + ')</span>';
            str += '</div>';

            str += '</div>';
        }
        str += '</div>';

        str += '<div class="video_selector__options">';
            str += '<div class="video_selector__options__row">';
                str += '<div class="video_selector__options__col" style="width: 11rem;">';
                    str += alignmentSelector('video_options_overlay_position', 'Overlay Position', valuePosition);
                str += '</div>';
                str += '<div class="video_selector__options__col">';
                    str += inputField('video_options_overlay_opacity', 'Opacity (0 - 100)', valueOpacity);
                    str += inputField('video_options_overlay_scale', 'Pixel Width', valueWidth);
                str += '</div>';
            str += '</div>';
        str += '</div>';
    str += '</div>';
    /* eslint-enable indent */

    template.innerHTML = str;

    return template;
};

// Send Page Designer event to update the selection
var emitUpdatedValues = function () {
    var overlayIdValue = $('.video_selector__container .video_selector__item.selected').data('value');
    var overlayId = null;
    if (overlayIdValue) {
        overlayId = overlayIdValue;
    }

    var overlayEnable = $('#video_options_overlay_enable').is(':checked');
    var overlayOpacity = $('#video_options_overlay_opacity').val();
    var overlayScale = $('#video_options_overlay_scale').val();
    var overlayPosition = $('.video_selector__alignment .aligner__col.selected').data('value');

    emit({ // eslint-disable-line
        type: 'sfcc:value',
        payload: {
            overlay_id: overlayId,
            overlay_enable: overlayEnable,
            overlay_opacity: overlayOpacity,
            overlay_scale: overlayScale,
            overlay_position: overlayPosition
        }
    });
};

// Page Designer ready event
subscribe('sfcc:ready', function(params) { // eslint-disable-line
    var value = params.value;
    var config = params.config;

    // The following variables are passed in the event, but not used here.
    // var isDisabled = params.isDisabled;
    // var isRequired = params.isRequired;
    // var dataLocale = params.dataLocale;
    // var displayLocale = params.displayLocale;

    var selectedOverlayId = null;
    var checkedOverlay = false;
    var valueOpacity = 100;
    var valueWidth = 300;
    var valuePosition = 'north_east';
    if (typeof value === 'object' && value !== null) {
        selectedOverlayId = value.overlay_id !== undefined ? value.overlay_id : selectedOverlayId;
        checkedOverlay = value.overlay_enable !== undefined ? value.overlay_enable : checkedOverlay;
        valueOpacity = value.overlay_opacity !== undefined ? value.overlay_opacity : valueOpacity;
        valueWidth = value.overlay_scale !== undefined ? value.overlay_scale : valueWidth;
        valuePosition = value.overlay_position !== undefined ? value.overlay_position : valuePosition;
    }

    // Append basic DOM
    var jsonObject = JSON.parse(config.fileData);

    var template = overlaySelectorTemplate(jsonObject.resources, selectedOverlayId, checkedOverlay, valueOpacity, valueWidth, valuePosition);
    var clone = document.importNode(template.content, true);
    document.body.appendChild(clone);

    // Video Selection event
    $('.video_selector__container .video_selector__item').on('click', function () {
        $('.video_selector__container .video_selector__item').removeClass('selected');
        $(this).addClass('selected');
        emitUpdatedValues();
    });

    // Checkbox change events
    $('#video_options_overlay_enable').on('change', function () {
        var overlayEnable = $('#video_options_overlay_enable').is(':checked');
        if (overlayEnable) {
            $('.video_selector__options_reveal').addClass('checked');
        } else {
            $('.video_selector__options_reveal').removeClass('checked');
        }
        emitUpdatedValues();
    });

    // Alignment selector click event
    $('.video_selector__alignment .aligner__col').on('click', function (e) {
        e.preventDefault();
        var parents = $(this).parents('.video_selector__alignment');
        $('.aligner__col', parents).removeClass('selected');
        $(this).addClass('selected');
        emitUpdatedValues();
    });

    // Opacity change event
    $('#video_options_overlay_opacity').on('change', function (e) {
        e.preventDefault();
        emitUpdatedValues();
    });

    // Scale/pixels change event
    $('#video_options_overlay_scale').on('change', function (e) {
        e.preventDefault();
        emitUpdatedValues();
    });
});

(() => {

	const imageTransform = function(public_id, version, secure_url, settings, format) {
    	var url_arr = secure_url.split('v' + version); // Remove version number
    	url_arr.splice(1, 0, settings); // Inject settings
    	var url_str = url_arr.join('');
    	url_str = url_str.replace('.' + format, '.jpg');
    	return url_str;
	}

	const inputCheckbox = function(idname, label, checked) {
		var str = '';
        str += '<div class="video_selector__checkbox">';
        str += '<label class="video_selector__checkbox__label">';
        str += '<input id="' + idname + '" name="' + idname + '" class="video_selector__checkbox__input" type="checkbox"' + (checked ? ' checked' : '') + ' />';
        str += '<span class="video_selector__checkbox__text">' + label + '</span>';
        str += '</label>';
		str += '</div>';

		return str;
	}

	const alignmentSelector = function(idname, label, selectedValue) {
	    var alignmentCell = function(value, selectedValue) {
	        return '<a class="aligner__col' + (value == selectedValue ? ' selected' : '') + '" href="#" data-value="' + value + '"></a>';
	    }

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
                        str += alignmentCell('east', selectedValue);
                        str += alignmentCell('center', selectedValue);
                        str += alignmentCell('west', selectedValue);
                    str += '</div>';
                    str += '<div class="aligner__row">';
                        str += alignmentCell('south_west', selectedValue);
                        str += alignmentCell('south', selectedValue);
                        str += alignmentCell('south_east', selectedValue);
                    str += '</div>';
                str += '</div>';
            str += '</div>';
        str += '</div>';

		return str;
	}

	const inputField = function(idname, label, value) {
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

		return str;
	}

	const thumbnailTemplate = function(optionArray, selected_overlay_id, checked_overlay, value_opacity, value_width, value_position) {
        const template = document.createElement('template');
        var str = '';
        var selected = '';
        var url;

        str += '<div class="video_selector__options">';
            str += inputCheckbox('video_options_overlay_enable', 'Enable Overlay', checked_overlay);
        str += '</div>';

        str += '<div class="video_selector__options_reveal' + (checked_overlay ? ' checked' : '') + '">';
            str += '<div class="video_selector__container">';
            for (var i=0; i < optionArray.length; i++) {
                selected = '';
                if (selected_overlay_id == optionArray[i].public_id) {
                    selected = ' selected';
                }
                str += '<div class="video_selector__item' + selected + '" data-value="' + optionArray[i].public_id + '">';
                url = imageTransform(optionArray[i].public_id, optionArray[i].version, optionArray[i].secure_url, 'c_lpad,h_50,w_50', optionArray[i].format);

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
                        str += alignmentSelector('video_options_overlay_position', 'Overlay Position', value_position);
                    str += '</div>';
                    str += '<div class="video_selector__options__col">';
                        str += inputField('video_options_overlay_opacity', 'Opacity (0 - 100)', value_opacity);
                        str += inputField('video_options_overlay_scale', 'Pixel Width', value_width);
                    str += '</div>';
                str += '</div>';
            str += '</div>';
        str += '</div>';

        template.innerHTML = str;

        return template;
	};

	const emitUpdatedValues = function() {
        var overlay_id = $('.video_selector__container .video_selector__item.selected').data('value');
        overlay_id = overlay_id ? overlay_id : null;

        var overlay_enable = $('#video_options_overlay_enable').is(":checked");
        var overlay_opacity = $('#video_options_overlay_opacity').val();
        var overlay_scale = $('#video_options_overlay_scale').val();
        var overlay_position = $('.video_selector__alignment .aligner__col.selected').data('value');

        console.log(
            'overlay_id', overlay_id + '\n',
            'overlay_enable', overlay_enable,
            'overlay_opacity', overlay_opacity,
            'overlay_scale', overlay_scale,
            'overlay_position', overlay_position
        );

        emit({
            type: 'sfcc:value',
            payload: {
                overlay_id: overlay_id,
                overlay_enable: overlay_enable,
                overlay_opacity: overlay_opacity,
                overlay_scale: overlay_scale,
                overlay_position: overlay_position
            }
        });
	}

	subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
		console.log('Overlay, sfcc:ready', dataLocale, displayLocale, value, config);

		var selected_overlay_id = null;
		var checked_overlay = false;
	    var value_opacity = 100;
        var value_width = 300;
        var value_position = 'north_east';
		if (typeof value === 'object' && value !== null) {
		    selected_overlay_id = value.overlay_id != undefined ? value.overlay_id : selected_overlay_id;
		    checked_overlay = value.overlay_enable != undefined ? value.overlay_enable : checked_overlay;
		    value_opacity = value.overlay_opacity != undefined ? value.overlay_opacity : value_opacity;
		    value_width = value.overlay_scale != undefined ? value.overlay_scale : value_width;
		    value_position = value.overlay_position != undefined ? value.overlay_position : value_position;
		}

		// Append basic DOM
        var jsonObject = JSON.parse(config.fileData);

        console.log('jsonObject.resources', jsonObject.resources);

        var template = thumbnailTemplate(jsonObject.resources, selected_overlay_id, checked_overlay, value_opacity, value_width, value_position);
		var clone = document.importNode(template.content, true);
		document.body.appendChild(clone);

        // Video Selection
		$('.video_selector__container .video_selector__item').on('click', function(e) {
			$('.video_selector__container .video_selector__item').removeClass('selected');
			$(this).addClass('selected');

			emitUpdatedValues();
		});

		// Checkboxes
		$('#video_options_overlay_enable').on('change', function(e) {
		    var overlay_enable = $('#video_options_overlay_enable').is(":checked");

		    if (overlay_enable) {
		        $('.video_selector__options_reveal').addClass('checked');
		    } else {
		        $('.video_selector__options_reveal').removeClass('checked');
		    }

			emitUpdatedValues();
		});

		// Alignment
        $('.video_selector__alignment .aligner__col').on('click', function(e) {
            e.preventDefault();
            var parents = $(this).parents('.video_selector__alignment');
            $('.aligner__col', parents).removeClass('selected');
            $(this).addClass('selected');

			emitUpdatedValues();
        });

	});
})();


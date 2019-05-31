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

	const thumbnailTemplate = function(optionArray, selected_video_id) { // checked_accessible, checked_crop, checked_sharpen
        const template = document.createElement('template');
        var str = '';
        var selected = '';
        var url;

        // str += 'ICON WILL BE HERE';

        str += '<div class="video_selector__container">';
        for (var i=0; i < optionArray.length; i++) {
            selected = '';
            if (selected_video_id == optionArray[i].public_id) {
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

        template.innerHTML = str;

        return template;
	};

	subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
		console.log('Video, sfcc:ready', dataLocale, displayLocale, value, config);

		var selected_video_id = null;
		if (typeof value === 'object' && value !== null) {
		    selected_video_id = value.video_id != undefined ? value.video_id : selected_video_id;
		}

		// Append basic DOM
        var jsonObject = JSON.parse(config.fileData);

        console.log('jsonObject.resources', jsonObject.resources);

        template = thumbnailTemplate(jsonObject.resources, selected_video_id); // checked_accessible, checked_crop, checked_sharpen
		clone = document.importNode(template.content, true);
		document.body.appendChild(clone);

        // Video Selection
		$('.video_selector__container .video_selector__item').on('click', function(e) {
			$('.video_selector__container .video_selector__item').removeClass('selected');
			$(this).addClass('selected');
			var video_id = $(this).data('value');
			video_id = video_id ? video_id : null;

			console.log(
			    'video_id', video_id
			);

			emit({
				type: 'sfcc:value',
				payload: {
					video_id: ( video_id ? video_id : null )
				}
			});
		});

		// Checkboxes
		$('#video_options_accessible, #video_options_crop, #video_options_sharpen').on('change', function(e) {
			var video_id = $('.video_selector__container .video_selector__item.selected').data('value');
			video_id = video_id ? video_id : null;

			console.log(
			    'video_id', video_id
			);

			emit({
				type: 'sfcc:value',
				payload: {
					video_id: video_id
				}
			});
		});
	});
})();


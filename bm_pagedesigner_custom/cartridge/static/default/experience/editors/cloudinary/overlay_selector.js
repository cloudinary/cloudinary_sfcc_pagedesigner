(() => {


    function handleBreakoutClose({ type, value }) {
        if (type === 'sfcc:breakoutApply') {
            document.asset = value;
            document.getElementsByClassName('overlay-selector')[0].innerHTML = mlButton(value);
            emitUpdatedValues();
        }
    }

    // Create an image URL with formatting options for thumbnails
    const imageTransform = function ({ public_id, version, secure_url, settings, format }) {
		const arr = secure_url.split('v' + version); // Remove version number
		arr.splice(1, 0, 'c_lpad,h_50,w_50'); // Inject settings
		return arr.join('').replace('.' + format, '.jpg');
    }

    // Create HTML for a checkbox
    const inputCheckbox = function (idname, label, checked) {
        var str = '';
        str += '<div class="video_selector__checkbox">';
        str += '<label class="video_selector__checkbox__label">';
        str += '<input id="' + idname + '" name="' + idname + '" class="video_selector__checkbox__input" type="checkbox"' + (checked ? ' checked' : '') + ' />';
        str += '<span class="video_selector__checkbox__text">' + label + '</span>';
        str += '</label>';
        str += '</div>';

        return str;
    }

    const mlButton = function (asset) {
        if (asset) {
            var url = imageTransform(asset);
            return `<div class="image_selector__item" data-value="${asset.public_id}">
  			<div class="image_selector__image">
   			 <a href="javascript:void(0);"><img src="${url}" /></a>
  			</div>
  			<div class="video_selector__data">
				<span class="video_selector__data__id">${asset.public_id}</span><br />
				<span class="video_selector__data__type">${asset.resource_type}</span> - 
				<span class="video_selector__data__format">${asset.format}</span> - 
				<span class="video_selector__data__size">${asset.width} x ${asset.height}</span>
			</div>
			<div class="video_selector__action">
				<button type="button" class="slds-button slds-button_neutral">Select</button>
			</div>
            </div>`;
        } else {
            return `<div style="display: flex; justify-content: space-between; align-items: center;">
            <span>No overlay image selected.</span>
            <button type="button" class="slds-button slds-button_neutral ml-breakout">Select</button>
            </div>`;
        }
    }

    // Create HTML for a alignment selector
    const alignmentSelector = function (idname, label, selectedValue) {
        var alignmentCell = function (value, selectedValue) {
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

        return str;
    }

    // Create HTML for an input field
    const inputField = function (idname, label, value) {
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

    const overlaySelectorTemplate = function (value, checked_overlay, value_opacity, value_width, value_position) {
        const template = document.createElement('template');
        var str = '';
        var selected = '';
        var url;

        str += '<div class="video_selector__options">';
        str += inputCheckbox('video_options_overlay_enable', 'Enable Overlay', checked_overlay);
        str += '</div>';

        str += '<div class="video_selector__options_reveal' + (checked_overlay ? ' checked' : '') + '">';
        str += '<div class="video_selector__container overlay-selector">';
        str += mlButton(value);
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

    // Send Page Designer event to update the selection
    const emitUpdatedValues = function () {
        overlay_id = document.asset ? document.asset.public_id : null;
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
                id: overlay_id,
                enable: overlay_enable,
                opacity: overlay_opacity,
                scale: overlay_scale,
                position: overlay_position,
                asset: document.asset

            }
        });
    }

    // Page Designer ready event
    subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
        console.log('Overlay, sfcc:ready', dataLocale, displayLocale, value, config);

        var selected_overlay_id = null;
        var checked_overlay = false;
        var value_opacity = 100;
        var value_width = 300;
        var value_position = 'north_east';
        var asset = null;
        if (typeof value === 'object' && value !== null) {
            selected_overlay_id = value.id != undefined ? value.id : selected_overlay_id;
            checked_overlay = value.enable != undefined ? value.enable : checked_overlay;
            value_opacity = value.opacity != undefined ? value.opacity : value_opacity;
            value_width = value.scale != undefined ? value.scale : value_width;
            value_position = value.position != undefined ? value.position : value_position;
            asset = value.asset != undefined ? value.asset : null;
        }

        var template = overlaySelectorTemplate(asset, checked_overlay, value_opacity, value_width, value_position);
        var clone = document.importNode(template.content, true);
        document.body.appendChild(clone);

        /*         // Video Selection event
                $('.video_selector__container .video_selector__item').on('click', function(e) {
                    $('.video_selector__container .video_selector__item').removeClass('selected');
                    $(this).addClass('selected');
        
                    emitUpdatedValues();
                }); */
        var selectButton = document.getElementsByClassName('ml-breakout')[0];
        if (selectButton) {
        selectButton.addEventListener('click', function (e) {
            emit({
                type: 'sfcc:breakout',
                payload: {
                    id: 'breakout',
                    title: 'Cloudinary Overlay image selector'
                }
            }, handleBreakoutClose)
        })
    }


        // Checkbox change events
        $('#video_options_overlay_enable').on('change', function (e) {
            var overlay_enable = $('#video_options_overlay_enable').is(":checked");

            if (overlay_enable) {
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

    });
})();


var $;

// Create an image URL with formatting options for thumbnails
var imageTransform = function (version, secureUrl, settings, format) {
    var urlArray = secureUrl.split('v' + version); // Remove version number
    urlArray.splice(1, 0, settings); // Inject settings
    var urlString = urlArray.join('');
    urlString = urlString.replace('.' + format, '.jpg');
    return urlString;
};

// Output HTML for video selector interface
var videoSelectorTemplate = function (optionArray, selectedVideoId) {
    var template = document.createElement('template');
    var str = '';
    var selected = '';
    var url;

    str += '<div class="video_selector__header"><div class="video_selector__header__icon"></div><div class="video_selector__header__text">Powered by Cloudinary</div></div>';
    str += '<div class="video_selector__container">';
    for (var i = 0; i < optionArray.length; i++) {
        selected = '';
        if (selectedVideoId === optionArray[i].public_id) {
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
    str += '<div class="video_selector__spacer"><div/>';

    template.innerHTML = str;

    return template;
};

// Page Designer ready event
subscribe('sfcc:ready', function (params) { // eslint-disable-line
    var value = params.value;
    var config = params.config;

    // The following variables are passed in the event, but not used here.
	// var isDisabled = params.isDisabled;
	// var isRequired = params.isRequired;
	// var dataLocale = params.dataLocale;
	// var displayLocale = params.displayLocale;

    var selectedVideoId = null;
    if (typeof value === 'object' && value !== null) {
        selectedVideoId = value.video_id !== undefined ? value.video_id : selectedVideoId;
    }

    var jsonObject = JSON.parse(config.fileData);

    var template = videoSelectorTemplate(jsonObject.resources, selectedVideoId);
    var clone = document.importNode(template.content, true);
    document.body.appendChild(clone);

    // Video Selection event
    $('.video_selector__container .video_selector__item').on('click', function () {
        $('.video_selector__container .video_selector__item').removeClass('selected');
        $(this).addClass('selected');

        var videoIdValue = $(this).data('value');
        var videoId = null;
        if (videoIdValue) {
            videoId = videoIdValue;
        }

        // Send Page Designer event to update the selection
        emit({ // eslint-disable-line
            type: 'sfcc:value',
            payload: {
                video_id: videoId
            }
        });
    });
});

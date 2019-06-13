/**
 * Cloudinary Video Component
 */

var resizeCloudinaryPlayers = function () {
	var $playerElements = $('.cloudinary-video-container div.cloudinary-video');
	$playerElements.each(function() {
		var $playerElement = $(this);
		var id = $playerElement.attr('id');

		$container = $playerElement.parents('.cloudinary-video-container').first();
		var width = Math.round($container.width());
		var height = Math.round($container.height());

		var player = document.cloudinaryPlayers[id];
		if (player !== undefined) {
			// console.log('Setting ' + id + ' Dimensions: ' + width + ' x ' + height);
			player.width(width);
			player.height(height);
		}
	});
};

function initializeCloudinaryPlayers () {
	var $videoElements = $('.cloudinary-video-container video.cloudinary-video');

	document.cloudinaryPlayers = {};

	$videoElements.each(function() {
		var $videoElement = $(this);
		var id = $videoElement.attr('id');

		// Cloudinary Configuration
		var cloudname = $videoElement.data('cloudname');
		var cname = $videoElement.data('cname');
		var secure = cname !== '' ?  true : location.protocol === 'https:';
		
	    // Video Options
		var publicId = $videoElement.data('cldPublicId');
		
	    // Player Options
		var autoplay = $videoElement.attr('autoplay') !== undefined;
		var controls = $videoElement.attr('controls') !== undefined;
		var loop = $videoElement.attr('loop') !== undefined;

	    // Overlay Options
		var overlay_id = $videoElement.data('overlayId');
		var overlay_opacity = $videoElement.data('overlayOpacity');
		var overlay_scale = $videoElement.data('overlayScale');
		var overlay_position = $videoElement.data('overlayPosition');

	    // Additional Options
		var options_captions = $videoElement.data('optionsCaptions');
		var options_instagram = $videoElement.data('optionsInstagramReady');

		// Source Settings
		var source = {
			publicId: publicId,
			loop: loop,
			controls: controls,
			autoplay: autoplay
		};

		// Overlay Settings
		var overlay = {};
		if (overlay_id) {
			overlay.overlay = new cloudinary.Layer().publicId(overlay_id);
			if (overlay_scale) {
				overlay.crop = 'scale';
				overlay.width = overlay_scale;
			}
			if (overlay_position) {
				overlay.gravity = overlay_position;
			}
			if (overlay_opacity) {
				overlay.opacity = overlay_opacity;
			}
		}
	
		// For responsive display, use width and height of parent container
		$container = $videoElement.parents('.cloudinary-video-container').first();
		var width = Math.round($container.width());
		var height = Math.round($container.height());

		var scaling = {};
		if (options_instagram) {
			// Instagram Ready sets the scaling to: w_1920,h_1280,c_fill,f_auto
			scaling = {
				width: 1280,
				height: 1920,
				crop: 'fill',
				// fetch_format: 'auto',
				gravity: 'auto'
			}
		} else {
			scaling = {
				width: width,
				height: height,
				crop: 'fill',
				// fetch_format: 'auto',
				gravity: 'auto'
			}
		}

		/*
		console.log(
			'publicId = ' + publicId +
			'\n' + 'cname = ' + cname +
			'\n' + 'cloudname = ' + cloudname +
			'\n' + 'loop = ' + loop +
			'\n' + 'controls = ' + controls +
			'\n' + 'autoplay = ' + autoplay +
			'\n' + 'options_captions = ' + options_captions +
			'\n' + 'options_instagram = ' + options_instagram +
			'\n' + 'overlay_id = ' + overlay_id +
			'\n' + 'overlay_opacity = ' + overlay_opacity +
			'\n' + 'overlay_scale = ' + overlay_scale +
			'\n' + 'overlay_position = ' + overlay_position,
			'\n' + 'player dimensions = ' +  width + ' x ' + height,
			'\n' + 'source', source,
			'\n' + 'overlay', overlay,
			'\n' + 'scaling', scaling
		);
		*/

		var cld;
		if (cname === '') {
			cld = cloudinary.Cloudinary.new({
				cloud_name: cloudname,
				secure: secure
			});
		} else {
			// When a custom cname is defined, we must use some specific settings
			cld = cloudinary.Cloudinary.new({
				cloud_name: cloudname,
				secure: secure,
				secure_distribution: cname,
				private_cdn: true
			});
		}

		try {
			var player = cld.videoPlayer(id, {
				transformation: [
					scaling,
					overlay
				],
				posterOptions: {
					transformation: [
						scaling,
						overlay
					]
				}
			});

			player.source(source);
			player.width(width);
			player.height(height);
			// player.fluid(true);

			/*
			var outputUrl = cld.url(publicId, {
				transformation: [
					scaling,
					// {gravity: 'auto'},
					overlay
				], resource_type: 'video'
			});
			console.log('Video URL: ', outputUrl);
			*/
			
			if (options_captions) {
				var cc_url = cld.url(publicId, {format: 'vtt', resource_type: 'raw'});
				var captionOption = {
					kind: 'subtitles',
					srclang: 'en',
					label: 'English',
					src: cc_url,
					default: true
				};
				player.videojs.addRemoteTextTrack(captionOption);
			};
		
			document.cloudinaryPlayers[id] = player; // Store reference to player object
		
		} catch(e) {
			console.log('Cloudinary Player Error', e);
		}
	});

	/**
	 * Window resize function includes a timeout so we don't cause performance issues
	 */
	var resizeTimer;
	$(window).on('resize', function(e) {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function() {
			resizeCloudinaryPlayers();
		}, 250);
	});
};

$(document).ready(function() {
	/**
     * Page Designer does not become active until document.ready. Because if this
     * it waits until streaming videos fully load. We need to delay initializing
     * Cloudinary video player a little bit.
     */
    
    if (!document.cloudinaryInit) {
        document.cloudinaryInit = true;
        setTimeout(function() {
            // console.log('Cloudinary: Waiting 0.5 seconds');
            initializeCloudinaryPlayers();
        }, 100);
    }
});
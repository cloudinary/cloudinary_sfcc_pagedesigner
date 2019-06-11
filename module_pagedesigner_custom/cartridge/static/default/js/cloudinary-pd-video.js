// Cloudinary Page Designer
$(document).ready(function() {
    function init() {
        console.log('Cloudinary Init');
        
        var $videoElements = $('.cloudinary-video-container video.cloudinary-video');
        console.log('There are ' + $videoElements.length + ' video elements');
        
        document.cloudinaryPlayers = {};

        $videoElements.each(function() {
            var $videoElement = $(this);
            var id = $videoElement.attr('id');

            var cloudname = $videoElement.data('cloudname');

            var publicId = $videoElement.data('cldPublicId');
            var autoplay = $videoElement.attr('autoplay') !== undefined;
            var controls = $videoElement.attr('controls') !== undefined;
            var loop = $videoElement.attr('loop') !== undefined;

            var overlay_id = $videoElement.data('overlayId');
            var overlay_opacity = $videoElement.data('overlayOpacity');
            var overlay_scale = $videoElement.data('overlayScale');
            var overlay_position = $videoElement.data('overlayPosition');

            var secure = true; // location.protocol === 'https:';

            var options_captions = $videoElement.data('optionsCaptions');

            var options_instagram = $videoElement.data('optionsInstagramReady');

            var source = {
                publicId: publicId,
                loop: loop,
                controls: controls,
                autoplay: autoplay
            };

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
            
            // Parent container div for width and height
            $container = $videoElement.parents('.cloudinary-video-container').first();
            var width = Math.round($container.width());
            var height = Math.round($container.height());
            
            console.log('Video Dimensions: ' + width + ' x ' + height);

			// Instagram Ready
			// ---------------
			// Need to set scaling to: w_1920,h_1280,c_fill,f_auto
			//
			// URL output should look like:
			// https://cloudinary-naveen-res.cloudinary.com/video/upload/w_1920,h_1280,c_fill,f_auto/Mercedes_Cars_Road_Trip.mp4
			var scaling = {}; // gravity: 'auto'
            if (options_instagram) {
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
                '\n' + 'loop = ' + loop +
                '\n' + 'controls = ' + controls +
                '\n' + 'autoplay = ' + autoplay +
                '\n' + 'options_captions = ' + options_captions +
                '\n' + 'options_instagram = ' + options_instagram +
                '\n' + 'overlay_id = ' + overlay_id +
                '\n' + 'overlay_opacity = ' + overlay_opacity +
                '\n' + 'overlay_scale = ' + overlay_scale +
                '\n' + 'overlay_position = ' + overlay_position,
                'source', source,
                'overlay', overlay,
                'scaling', scaling
            );
            */

            var cld = cloudinary.Cloudinary.new({
                cloud_name: cloudname,
                secure: secure,
                secure_distribution: 'cloudinary-naveen-res.cloudinary.com',
                private_cdn: true
            });

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
				// player.fluid(true);

				var outputUrl = cld.url(publicId, {
					transformation: [
						scaling,
						// {gravity: 'auto'},
						overlay
					], resource_type: 'video'
				});
			
				console.log('Video URL: ', outputUrl);

				if (options_captions) {
					var cc_url = cld.url(publicId, {format: 'vtt', resource_type: 'raw'});
					console.log('Caption URL:', cc_url);

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
        		console.log('Player Error', e);
        	}
        });
        
		var resizeTimer;
		$(window).on('resize', function(e) {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function() {
				console.log('Cloudinary resize');
				
				var $playerElements = $('.cloudinary-video-container div.cloudinary-video');
				$playerElements.each(function() {
					var $playerElement = $(this);
					var id = $playerElement.attr('id');
					
					var width = Math.round($playerElement.width());
					var height = Math.round($playerElement.height());
					
					var player = document.cloudinaryPlayers[id];
					if (player !== undefined) {
			            console.log('Setting ' + id + ' Dimensions: ' + width + ' x ' + height, player);
						player.width(width);
						player.height(height);						
					}
				});
			}, 250);
		});
    };

	// Page Designer does not become active until document.ready. Because if this
	// it waits until streaming videos fully load. We need to delay initializing
	// Cloudinary video player a little bit.
	if (!document.cloudinaryInit) {
		document.cloudinaryInit = true;
		setTimeout(function(){
			console.log('Cloudinary: Waiting 0.5 seconds');
			init();
		}, 500);
	} else {
		console.log('Cloudinary: Timeout already set...');
	}
});
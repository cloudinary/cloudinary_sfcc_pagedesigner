// Cloudinary Page Designer

$(document).ready(function() {
    function init() {
        console.log('Initialize Cloudinary Player');

        $('.cloudinary-video-container .cloudinary-video').each(function() {
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

            var secure = location.protocol === 'https:';

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
	    	}

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

			// This is the URL that is being generated:
			// https://res.cloudinary.com/cloudinary-naveen/video/upload/c_fill,f_auto,g_auto,h_1280,w_1920/v1/videos/outdoors.mp4?_s=vp-1.1.3

			// Should look like this with a custom CNAME
			// https://cloudinary-naveen-res.cloudinary.com/video/upload/w_1920,h_1280,c_fill,f_auto/Mercedes_Cars_Road_Trip.mp4
			
			// var cld = cloudinary.Cloudinary.new({ cloud_name: ‘asisayagcloudinary’, secure: ‘true’, secure_distribution: “your.cname.com”});
			// important to have both secure=true and secure_distribution
            var cld = cloudinary.Cloudinary.new({
                cloud_name: cloudname,
                secure: secure
            });

            var player = cld.videoPlayer(id, {
            	transformation: [
            	    scaling,
            	    overlay
            	],
            	posterOptions: {
					transformation: [
					    scaling
					]
        		}
        	});

            player.source(source);

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
        });
    };

	// Page Designer does not become active until document.ready. Because if this
	// it waits until streaming videos fully load. We need to delay initializing
	// Cloudinary video player a little bit.
    setTimeout(function(){
        console.log('Cloudinary: Waiting 0.5 seconds');
        init();
    }, 500);
});

/*
#2:  To add the video “woman_coat_orig” as a pre-roll to the previous step, add the following to the url:
https://cloudinary-naveen-res.cloudinary.com/video/upload/w_1920,h_1280,c_fill,f_auto,e_fade:1000/l_video:woman_coat_orig,w_1920,h_1280,c_fill,so_0,fl_splice,e_fade:-1000/Mercedes_Cars_Road_Trip.mp4

#3:  To Make instagram ready:  https://cloudinary-naveen-res.cloudinary.com/video/upload/w_1920,h_1280,c_fill,f_auto/l_video:woman_coat_orig,w_1920,h_1280,c_fill,so_0,fl_splice/g_auto,w_1080,h_1920,c_fill/Mercedes_Cars_Road_Trip.mp4

#4:  To Add an overlay, in this example an image called “cloudinary-logo”  :
https://cloudinary-naveen-res.cloudinary.com/video/upload/w_1920,h_1280,c_fill,f_auto/l_video:woman_coat_orig,w_1920,h_1280,c_fill,so_0,fl_splice/g_auto,w_1080,h_1920,c_fill/l_cloudinary_icon_for_dark_bg_print,o_90,g_north_east/Mercedes_Cars_Road_Trip.mp4

https://cloudinary-naveen-res.cloudinary.com/video/upload/w_1920,h_1280,c_fill,f_auto,l_cloudinary_icon_for_dark_bg_print,o_90,g_north_east/Mercedes_Cars_Road_Trip.mp4

#5:  If user only chose “Make instagram ready” then :
https://cloudinary-naveen-res.cloudinary.com/video/upload/g_auto,w_1080,h_1920,c_fill,f_auto/Mercedes_Cars_Road_Trip.mp4
Note, this same transformation can be used for mobile with the appropriate width (w_) and height (h_) values.
*/

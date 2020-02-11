/**
 * Cloudinary Video Component
 */

var resizeCloudinaryPlayers = function () {
    var $playerElements = $('.cloudinary-video-container div.cloudinary-video');
    $playerElements.each(function () {
        var autocropresize = $(this).data('autocropresize');
        if (autocropresize) {
            var $playerElement = $(this);
            var id = $playerElement.attr('id');

            // var $container = $playerElement.parents('.cloudinary-video-container').first();
            // var width = Math.round($container.width());
            // var height = Math.round($container.height());

            var player = document.cloudinaryPlayers[id];
            if (player !== undefined) {
                // player.width(width);
                // player.height(height);
                player.videojs.fill(true);
            }
        }
    });
};

/**
 * Initialize Cloudinary Players
 */
function initializeCloudinaryPlayers() {
    var $videoElements = $('.cloudinary-video-container video.cloudinary-video');

    document.cloudinaryPlayers = {};

    $videoElements.each(function () {
        var $videoElement = $(this);
        var id = $videoElement.attr('id');

        // Cloudinary Configuration
        var cloudname = $videoElement.data('cloudname');
        var cname = $videoElement.data('cname');
        var secure = cname !== '' ? true : location.protocol === 'https:';

        // Video Options
        var publicId = $videoElement.data('cldPublicId');

        // Player Options
        var autoplay = $videoElement.attr('autoplay') !== undefined;
        var controls = $videoElement.attr('controls') !== undefined;
        var loop = $videoElement.attr('loop') !== undefined;
        var autocropresize = $videoElement.data('autocropresize');

        // Overlay Options
        var overlayId = $videoElement.data('overlayId');
        var overlayOpacity = $videoElement.data('overlayOpacity');
        var overlayScale = $videoElement.data('overlayScale');
        var overlayPosition = $videoElement.data('overlayPosition');

        // Additional Options
        var optionsCaptions = $videoElement.data('optionsCaptions');
        var optionsInstagram = $videoElement.data('optionsInstagramReady');

        // Source Settings
        var source = {
            publicId: publicId,
            loop: loop,
            controls: controls,
            autoplay: autoplay
        };

        // Overlay Settings
        var overlay = {};
        if (overlayId) {
            overlay.overlay = new cloudinary.Layer().publicId(overlayId); // eslint-disable-line
            if (overlayScale) {
                overlay.crop = 'scale';
                overlay.width = overlayScale;
            }
            if (overlayPosition) {
                overlay.gravity = overlayPosition;
            }
            if (overlayOpacity) {
                overlay.opacity = overlayOpacity;
            }
        }

        // For responsive display, use width and height of parent container
        var $container = $videoElement.parents('.cloudinary-video-container').first();
        var width = Math.round($container.width());
        var height = Math.round($container.height());

        var scaling = {};
        if (optionsInstagram) {
            // Instagram Ready sets the scaling to: w_1920,h_1280,c_fill,f_auto
            scaling = {
                width: 1280,
                height: 1920,
                crop: 'fill',
                // fetch_format: 'auto',
                gravity: 'auto'
            };
        } else if (autocropresize) {
            scaling = {
                width: width,
                height: height,
                crop: 'fill',
                // fetch_format: 'auto',
                gravity: 'auto'
            };
        }
        
        console.log(
            'publicId = ' + publicId +
            '\n' + 'cname = ' + cname +
            '\n' + 'cloudname = ' + cloudname +
            '\n' + 'loop = ' + loop +
            '\n' + 'controls = ' + controls +
            '\n' + 'autoplay = ' + autoplay +
            '\n' + 'optionsCaptions = ' + optionsCaptions +
            '\n' + 'optionsInstagram = ' + optionsInstagram +
            '\n' + 'overlayId = ' + overlayId +
            '\n' + 'overlayOpacity = ' + overlayOpacity +
            '\n' + 'overlayScale = ' + overlayScale +
            '\n' + 'overlayPosition = ' + overlayPosition,
            '\n' + 'player dimensions = ' +  width + ' x ' + height,
            '\n' + 'source =',  source,
            '\n' + 'overlay =',  overlay,
            '\n' + 'scaling =' , scaling,
            '\n' + 'autoresize = ' + autocropresize            
        );
        

        var cld;
        if (cname === '') {
            cld = cloudinary.Cloudinary.new({ // eslint-disable-line
                cloud_name: cloudname,
                secure: secure
            });
        } else {
            // When a custom cname is defined, we must use some specific settings
            cld = cloudinary.Cloudinary.new({ // eslint-disable-line
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
            if (autocropresize) {
                 //player.width(width);
                 //player.height(height);
                player.videojs.fill(true);
            } else {
                player.fluid(true);
            }

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

            if (optionsCaptions) {
                var ccURL = cld.url(publicId, { format: 'vtt', resource_type: 'raw' });
                var captionOption = {
                    kind: 'subtitles',
                    srclang: 'en',
                    label: 'English',
                    src: ccURL,
                    default: true
                };
                player.videojs.addRemoteTextTrack(captionOption);
            }

            document.cloudinaryPlayers[id] = player; // Store reference to player object
        } catch (e) {
            console.log('Cloudinary Player Error', e); // eslint-disable-line
        }
    });

    /**
     * Window resize function includes a timeout so we don't cause performance issues
     */
    var resizeTimer;
    $(window).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resizeCloudinaryPlayers();
        }, 250);
    });
}

$(document).ready(function () {
    /**
     * Page Designer does not become active until document.ready. Because if this
     * it waits until streaming videos fully load. We need to delay initializing
     * Cloudinary video player a little bit.
     */

    if (!document.cloudinaryInit) {
        document.cloudinaryInit = true;
        setTimeout(function () {
            initializeCloudinaryPlayers();
        }, 100);
    }
});

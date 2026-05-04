/**
 * Resolves the correct widgetOptions and public_id for the current viewport
 * when per-form-factor options are present.
 * Breakpoints match the editor widget: mobile ≤ 767, tablet ≤ 1023, desktop > 1023.
 * Falls back Mobile → Tablet → Desktop (matching editor inheritance order).
 */
function resolvePlayerOptions(player) {
    var widgetOptions = player.widgetOptions;
    var publicId = player.public_id;

    if (player.formFactorOptions) {
        try {
            var ffOptions = JSON.parse(player.formFactorOptions);
            var w = window.innerWidth;
            var ff = w <= 767 ? 'mobile' : (w <= 1023 ? 'tablet' : 'desktop');
            // Apply same inheritance fallback as the editor (Mobile → Tablet → Desktop)
            var selected = ffOptions[ff] ||
                           ffOptions['mobile'] ||
                           ffOptions['tablet'] ||
                           ffOptions['desktop'];
            if (selected) {
                widgetOptions = selected.widgetOptions;
                publicId = selected.public_id;
            }
        } catch (e) {
            // fall through to defaults already set above
        }
    }

    return { widgetOptions: widgetOptions, publicId: publicId };
}

function initializeCloudinaryPlayers() {
    let conf = {
        cloud_name: window.cloudName
    }
    if (window.cname) {
        conf.secure_distribution = window.cname;
        conf.private_cdn = true;
    }
    const cld = window.cldPDVideoPlayer.Cloudinary.new(conf);

    window.players.forEach(player => {
        if (player && player.widgetOptions) {
            const resolved = resolvePlayerOptions(player);
            const pCnf = JSON.parse(resolved.widgetOptions);
            const p = cld.videoPlayer(player.id, pCnf.playerConfig);
            p.source(resolved.publicId, pCnf.sourceConfig);
            p.on('error', function (e) {
                const error = e.Player.videojs.error();
                if (error && error.code === 10) {
                    p.videojs.error(null);
                    p.videojs.error({ code: null, message: "Generating the video, please wait." });
                }
            })
        }
    });
}

initializeCloudinaryPlayers();

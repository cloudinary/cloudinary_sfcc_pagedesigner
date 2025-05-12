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
            const pCnf = JSON.parse(player.widgetOptions);
            const p = cld.videoPlayer(player.id, pCnf.playerConfig);
            p.source(player.public_id, pCnf.sourceConfig);
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

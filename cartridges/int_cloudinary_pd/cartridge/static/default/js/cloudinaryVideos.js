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
        if (player) {
            const pCnf = JSON.parse(player.widgetOptions);
            const playerConfig = pCnf.playerConfig;
            const sourceConfig = pCnf.sourceConfig;
            const widgetOptions = {...playerConfig, ...sourceConfig}
            const p = cld.videoPlayer(player.id, widgetOptions);
            p.source(player.public_id, {});
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

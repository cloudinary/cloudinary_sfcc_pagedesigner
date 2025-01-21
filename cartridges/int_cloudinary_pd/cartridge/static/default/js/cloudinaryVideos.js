'use strict';

window.initializeCloudinaryPlayers = function () {
    if (!document.cloudinaryInit) {
        document.cloudinaryInit = true;
        let conf = {
            cloud_name: window.cloudName
        }
        if (window.cname) {
            conf.secure_distribution = window.cname;
            conf.private_cdn = true;
        }
        var cld = window.cldPDVideoPlayer.Cloudinary.new(conf);
        const convertToSnakeCase = obj => JSON.parse(JSON.stringify(obj).replace(/"([^"]+)":/g, (_, p1) => `"${p1.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}":`));
    
        window.players.forEach(player => {
            if (player) {
                const pCnf = JSON.parse(player.playerConf);
                const p = cld.videoPlayer(player.id, pCnf.playerConfig);
                pCnf.sourceConfig['transformation'] = convertToSnakeCase(pCnf.sourceConfig.transformation)
                pCnf.playerConfig['cloudName'] = pCnf.cloudName;
                p.source(pCnf.publicId, pCnf.sourceConfig);
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
}

function initializeCloudinaryPlayers() {
    const convertToSnakeCase = obj => JSON.parse(JSON.stringify(obj).replace(/"([^"]+)":/g, (_, p1) => `"${p1.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}":`));
    window.players.forEach(player => {
        if (player) {
            const pCnf = JSON.parse(player.playerConf);
            const p = cld.videoPlayer(player.id, pCnf.playerConfig);
            pCnf.sourceConfig['transformation'] = convertToSnakeCase(pCnf.sourceConfig.transformation)
            pCnf.playerConfig['cloudName'] = pCnf.cloudName;
            p.source(pCnf.publicId, pCnf.sourceConfig);
            p.on('error', function(e) {
                const error = e.Player.videojs.error();
                if (error && error.code === 10) {
                    p.videojs.error(null);
                    p.videojs.error({code: null, message: "Generating the video, please wait."});
                }
            })
        }
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
            let conf = {
                cloud_name: window.cloudName
            }
            if (window.cname) {
                conf.secure_distribution = window.cname;
                conf.private_cdn = true;
            }
            cld = cloudinary.Cloudinary.new(conf);
            initializeCloudinaryPlayers();
        }, 100);
    }
});

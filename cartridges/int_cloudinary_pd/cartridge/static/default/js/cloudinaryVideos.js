function initializeCloudinaryPlayers() {
    window.players.forEach(player => {
        if (player) {
            var pCnf = JSON.parse(player.playerConf);
            var p = cld.videoPlayer(player.id, pCnf.playerConfig);
            p.fluid(true);
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
    console.log(players);

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
            // console.log('Cloudinary: Waiting 0.5 seconds');
            let conf = {
                cloud_name: window.cloudName
            }
            if (window.cname) {
                conf.cname = window.cname
            }
            cld = cloudinary.Cloudinary.new(conf);
            initializeCloudinaryPlayers();
        }, 100);
    }
});
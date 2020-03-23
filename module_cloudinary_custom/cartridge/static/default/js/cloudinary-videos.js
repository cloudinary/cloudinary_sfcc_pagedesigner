function initializeCloudinaryPlayers() {
    window.players.forEach(player => {
        var pCnf = JSON.parse(player.playerConf);
        var p = cld.videoPlayer(player.id, pCnf.playerConfig);
        p.fluid(true);
        p.source(pCnf.publicId, pCnf.sourceConfig);
    });
    console.log(players);
}

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
            cld = cloudinary.Cloudinary.new({ cloud_name: window.cloudName});
            initializeCloudinaryPlayers();
        }, 100);
    }
});
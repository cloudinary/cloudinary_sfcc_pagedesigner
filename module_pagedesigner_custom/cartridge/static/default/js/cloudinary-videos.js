function initializeCloudinaryPlayers() {
    var videosEls = document.getElementsByClassName('cld-video');
    var videoIds = Array.prototype.map.call(videosEls, function(el) {
        return el.id;
    })
    videoIds.forEach(element => {
        var p = cld.videoPlayer(element);
        p.fluid(true);
    });
    console.log(videoIds);
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
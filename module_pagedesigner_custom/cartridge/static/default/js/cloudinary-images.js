window.addEventListener('load', lqipChnage); 

function lqipChnage() {
    console.log('LQIP');
    var imgsColl = document.getElementsByClassName('ml-image');
    for (var image of imgsColl) {
        if (image.dataset.realUrl !== image.src) {
            image.src = image.dataset.realUrl;
            image.srcset = image.dataset.realSrcset;
        }
    }
}
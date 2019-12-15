window.addEventListener('load', lqipChnage); 

function lqipChnage() {
    console.log('LQIP');
    var imgsColl = document.getElementsByClassName('ml-image');
    for (var image of imgsColl) {
        image.src = image.dataset.realUrl;
    }
}
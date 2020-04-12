
(() => {
    subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
        let iFrame = document.createElement('iframe');
        iFrame.src = getIframeUrl(value, config);
        iFrame.id = 'image-form';
        iFrame.setAttribute('frameborder', 0);
        iFrame.setAttribute('marginwidth', 0);
        iFrame.setAttribute('marginheight', 0);
        iFrame.setAttribute('vspace', 0);
        iFrame.setAttribute('hspace', 0);
        iFrame.setAttribute('scrolling', "no");
        iFrame.style.width = '1px';
        iFrame.style.minWidth = '100%';
        iFrame.style.minHeight = '800px';
        document.body.appendChild(iFrame);
        let ifrm = document.querySelector('iframe');
        window.addEventListener('message', (event) => {
            //if (event.origin === 'https://sfcc.t-y.co') {
                handleIframeMessage(event.data, ifrm, value, config);
            //}
        }
        )
        iFrameResize({ log: true }, '#image-form');
    })
})()

function getIframeUrl(value, config) {
    let val = encodeURIComponent(JSON.stringify(value));
    let global = encodeURIComponent(JSON.stringify(config.globalTrans));
    return "https://sfcc.t-y.co/image?cloudName=" + config.cloudName + '&value=' + val + '&global=' + global;
}
function autosizeIframe(iframe) {
    iframe.height = iframe.contentWindow.document.body.scrollHeight + "px";
}

const getBreackpoints = (brUrl, publicId, ifrm) => {
    fetch(brUrl + '?publicId=' + publicId).then(response => {
        if (response.ok) {
            response.json().then(data => {
                ifrm.contentWindow.postMessage(data, '*');
            })
        }
    })
}

const handleIframeMessage = (message, ifrm, value = null, config) => {
    if (message.action) {
        switch (message.action) {
            case 'openMl':
                emit({
                    type: 'sfcc:breakout',
                    payload: {
                        id: 'overlayBreakout',
                        title: `Cloudinary Image`
                    }
                }, (data) => {
                    getBreackpoints(config.breakpointsUrl, data.value.public_id, ifrm);
                    data.value.origin = message.source;
                    ifrm.contentWindow.postMessage(data.value, '*');
                });
                break;
            case 'ready':
                ifrm.contentWindow.postMessage(value, '*');
                break;
            case 'done':
                delete message.action;
                var val = Object.assign({}, message);
                emit({
                    type: 'sfcc:value',
                    payload: val
                })
                break;

        }
    }
    console.log(message);
}
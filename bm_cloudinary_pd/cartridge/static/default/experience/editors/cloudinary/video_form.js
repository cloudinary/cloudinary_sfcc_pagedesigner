
(() => {
    subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
        let iFrame = document.createElement('iframe');
        let val = encodeURIComponent(JSON.stringify(value));
        let global = encodeURIComponent(JSON.stringify(config.globalTrans));
        iFrame.src = "https://sfcc.t-y.co/video-side-panel?cloudName=" + config.cloudName + '&value=' + val + '&global=' + global;
        iFrame.id = 'video-form';
        iFrame.setAttribute('frameborder', 0);
        iFrame.setAttribute('marginwidth', 0);
        iFrame.setAttribute('marginheight', 0);
        iFrame.setAttribute('vspace', 0);
        iFrame.setAttribute('hspace', 0);
        iFrame.setAttribute('scrolling', "no");
        document.body.appendChild(iFrame);
        let ifrm = document.querySelector('iframe');
        window.addEventListener('message', (event) => {
            //if (event.origin === 'https://sfcc.t-y.co') {
                handleIframeMessage(event.data, ifrm, value, config);
            //}
        }
        )
        iFrameResize({heightCalculationMethod: 'taggedElement' }, '#video-form');
    })
})()


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
            case 'openAdvConf':
                emit({
                    type: 'sfcc:breakout',
                    payload: {
                        id: 'advBreakout',
                        title: `Cloudinary Video Advanced Configuration`
                    }
                }, (data) => {
                    data.value.origin = 'advConf'
                    ifrm.contentWindow.postMessage(data.value, '*');
                });
                break;
            case 'openMl':
                emit({
                    type: 'sfcc:breakout',
                    payload: {
                        id: 'breakout',
                        title: `Cloudinary Video`
                    }
                }, (data) => {
                    data.value.origin = message.source;
                    ifrm.contentWindow.postMessage(data.value, '*');
                });
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
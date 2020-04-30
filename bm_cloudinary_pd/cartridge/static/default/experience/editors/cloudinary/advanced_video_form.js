
(() => {
    subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
        let iFrame = document.createElement('iframe');
        let val = encodeURIComponent(JSON.stringify(value));
        iFrame.src = config.iFrameEnv + "/video?cloudName=" + config.cloudName + '&value=' + val;
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
            if (event.origin === config.iFrameEnv) {
                handleIframeMessage(event.data, ifrm, value, config);
            }
        }
        )
        iFrameResize({heightCalculationMethod: 'taggedElement' }, '#video-form');
    })
})()


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
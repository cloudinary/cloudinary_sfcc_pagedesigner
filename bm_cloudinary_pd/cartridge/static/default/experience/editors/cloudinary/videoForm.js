
(() => {
    subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
        let iFrame = document.createElement('iframe');
        iFrame.src = getIframeUrl(value, config);
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
        window.config = config;
        iFrameResize({ heightCalculationMethod: 'taggedElement' }, '#video-form');
    })
})()

function getIframeUrl(value, config) {
    let val = encodeURIComponent(JSON.stringify(cldUtils.dehydrate(value)));
    let global = encodeURIComponent(JSON.stringify(config.globalTrans));
    return config.iFrameEnv + "/video-side-panel?cloudName=" + config.cloudName + '&cname=' + config.cname + '&value=' + val + '&global=' + global;
}

function reInitIframe(value, config) {
    var iFrm = document.getElementById('video-form');
    if (iFrm) {
        iFrm.src = getIframeUrl(value, config);
    }
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
                emit({
                    type: 'sfcc:valid',
                    payload: {
                        valid: false,
                    }
                });
                emit({
                    type: 'sfcc:value',
                    payload: message
                });
                break;
            case 'invalid':
                emit({
                    type: 'sfcc:valid',
                    payload: {
                        valid: false,
                    }
                });
            case 'ready':
                value.origin = 'ready';
                ifrm.contentWindow.postMessage(value, '*');
                break;

        }
    }
    console.log(message);
}
listen('sfcc:value', value => {
    reInitIframe(value, window.config);
});
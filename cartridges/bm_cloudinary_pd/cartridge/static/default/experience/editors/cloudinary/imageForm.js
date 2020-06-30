const getIframeUrl = (value, config) => {
    let val = encodeURIComponent(JSON.stringify(cldUtils.dehydrate(value)));
    let global = encodeURIComponent(JSON.stringify(config.globalTrans));
    return config.iFrameEnv + '/image-side-panel?cloudName=' + config.cloudName + '&canme=' + config.cname + '&value=' + val + '&global=' + global;
};

const reInitIframe = (value, config) => {
    var iFrm = document.getElementById('image-form');
    if (iFrm) {
        iFrm.src = getIframeUrl(value, config);
    }
};

const getBreackpoints = (brUrl, publicId, ifrm) => {
    fetch(brUrl + '?publicId=' + publicId).then((response) => {
        if (response.ok) {
            response.json().then((data) => {
                ifrm.contentWindow.postMessage(data, '*');
            });
        }
    });
};

const handleIframeMessage = (message, ifrm, value = null, config) => {
    if (message.action) {
        switch (message.action) {
        case 'openAdvConf':
            emit({
                type: 'sfcc:breakout',
                payload: {
                    id: 'advBreakout',
                    title: 'Cloudinary Image Advanced Configuration'
                }
            }, (data) => {
                data.value.origin = 'advConf';
                ifrm.contentWindow.postMessage(data.value, '*');
            });
            break;
        case 'openMl':
            emit({
                type: 'sfcc:breakout',
                payload: {
                    id: 'breakout',
                    title: 'Cloudinary Image'
                }
            }, (data) => {
                getBreackpoints(config.breakpointsUrl, data.value.public_id, ifrm);
                data.value.origin = message.source;
                ifrm.contentWindow.postMessage(data.value, '*');
            });
            break;
        case 'openLinkBuilder':
            emit({
                type: 'sfcc:breakout',
                payload: {
                    id: 'sfcc:linkBuilder',
                    title: 'Link Builder'
                }
            }, (data) => {
                data.value.origin = 'imageLink';
                fetch(config.linkBuilderUrl + '?linkData=' + encodeURIComponent(JSON.stringify(data.value.value))).then((response) => {
                    if (response.status === 200) {
                        response.json().then((json) => {
                            if (json.status === 'ok') {
                                data.value.url = json.url;
                                ifrm.contentWindow.postMessage(data.value, '*');
                            }
                        }).catch((e) => { console.log(e); });
                    }
                });
            });
            break;
        case 'done':
            delete message.action;
            emit({
                type: 'sfcc:valid',
                payload: {
                    valid: false
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
                    valid: false
                }
            });
            emit({
                type: 'sfcc:value',
                payload: null
            });
            break;
        case 'ready':
            value.origin = 'ready';
            ifrm.contentWindow.postMessage(value, '*');
            break;
        }
    }
};
(() => {
    subscribe('sfcc:ready', async ({ value, config }) => {
        let iFrame = document.createElement('iframe');
        iFrame.src = getIframeUrl(value, config);
        iFrame.id = 'image-form';
        iFrame.setAttribute('frameborder', 0);
        iFrame.setAttribute('marginwidth', 0);
        iFrame.setAttribute('marginheight', 0);
        iFrame.setAttribute('vspace', 0);
        iFrame.setAttribute('hspace', 0);
        iFrame.setAttribute('scrolling', 'no');
        iFrame.setAttribute('name', Date.now().toString());
        document.body.appendChild(iFrame);
        let ifrm = document.querySelector('iframe');
        window.addEventListener('message', (event) => {
            if (event.origin === config.iFrameEnv) {
                handleIframeMessage(event.data, ifrm, value, config);
            }
        });
        window.config = config;
        iFrameResize({ heightCalculationMethod: 'taggedElement' }, '#image-form');
    });
    listen('sfcc:value', (value) => {
        reInitIframe(value, window.config);
    });
})();

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
        iFrame.style.width = '1px';
        iFrame.style.minWidth = '100%';
        iFrame.style.minHeight = '800px';
        document.body.appendChild(iFrame);
        let ifrm = document.querySelector('iframe');
        window.addEventListener('message', (event) => {
            if (event.origin === config.iFrameEnv) {
                handleIframeMessage(event.data, ifrm, value, config);
            }
        });
        parentIFrame.getPageInfo((i) => {
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const headerHeight = 61;
            const footerHeight = 61;
            // We remove - 6rem padding, header & footer
            iFrame.height = i.clientHeight - (6 * rem) - headerHeight - footerHeight;
        });
    });
})();

/**
 * build the iFrame url
 * @param {Object} value SFCC value
 * @param {Object} config SFCC config
 * @returns {string} url
 */
function getIframeUrl(value, config) {
    let val = encodeURIComponent(JSON.stringify(cldUtils.dehydrate(value)));
    let global = encodeURIComponent(JSON.stringify(config.globalTrans));
    return config.iFrameEnv + '/image?cloudName=' + config.cloudName + '&value=' + val + '&global=' + global;
}

const handleIframeMessage = (message, ifrm, value = null) => {
    if (message.action) {
        switch (message.action) {
        case 'openMl':
            emit({
                type: 'sfcc:breakout',
                payload: {
                    id: 'overlayBreakout',
                    title: 'Cloudinary Image'
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
            });
            break;
        case 'ready':
            value.origin = 'ready';
            ifrm.contentWindow.postMessage(value, '*');
            break;
        }
    }
};


(() => {
    subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
        let iFrame = document.createElement('iframe');
        let val = encodeURIComponent(JSON.stringify(value));
        let global = encodeURIComponent(JSON.stringify(config.globalTrans));
        iFrame.src = "https://sfcc-pd.local:1234/image-side-panel?cloudName=" + config.cloudName + '&value=' + val + '&global=' + global;
        iFrame.id = 'image-form';
        iFrame.setAttribute('frameborder', 0);
        iFrame.setAttribute('marginwidth', 0);
        iFrame.setAttribute('marginheight', 0);
        iFrame.setAttribute('vspace', 0);
        iFrame.setAttribute('hspace', 0);
        iFrame.setAttribute('scrolling', "no");
        document.body.appendChild(iFrame);
        let ifrm = document.querySelector('iframe');
        window.addEventListener('message', (event) => {
            //if (event.origin === 'https://sfcc-pd.local:1234') {
                handleIframeMessage(event.data, ifrm, value, config);
            //}
        }
        )
        iFrameResize({heightCalculationMethod: 'taggedElement' }, '#image-form');
    })
})()

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

const isObjectEmpty = (obj) => Object.keys(obj).length === 0 && obj.constructor === Object;

const handleIframeMessage = (message, ifrm, value = null, config) => {
    if (message.action) {
        switch (message.action) {
            case 'openAdvConf':
                emit({
                    type: 'sfcc:breakout',
                    payload: {
                        id: 'advBreakout',
                        title: `Cloudinary Image Advanced Configuration`
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
                        title: `Cloudinary Image`
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
                          console.log(data);
                      });
                    break;
            case 'done':
                delete message.action;
                var val = isObjectEmpty(message.formValues.image) ? null : message;
                emit({
                    type: 'sfcc:value',
                    payload: val
                })
                break;

        }
    }
    console.log(message);
}

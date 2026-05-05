/**
 * When the parent editor uses the new per-form-factor format
 * ({ formValues: { desktop, mobile, tablet }, posterMode, playerOptions, transformationOverride })
 * the iframe still expects formValues.video.asset.public_id to render its preview.
 *
 * cldUtils.cleanValue (called inside dehydrate) strips every top-level key except
 * "formValues" and "breakpoints", so anything outside formValues is lost.
 * We therefore map the resolved asset back into formValues.video.asset which is
 * exactly what the iframe reads.
 */
function normalizeValueForIframe(value) {
    if (!value || !value.formValues) return value;
    var fv = value.formValues;

    // Already in the old format – nothing to do
    if (fv.video && fv.video.asset) return value;

    // Resolve current asset from the new per-form-factor format
    var entry = fv.desktop || fv.tablet || fv.mobile;
    if (!entry || !entry.asset) return value;

    var asset = entry.asset;

    // If a full Advanced config was previously saved, restore it directly.
    // This preserves every overlay field (font family, size, position, colour,
    // text content, image overlay, player customisations, etc.) so the iframe
    // can repopulate its UI exactly as the user left it.
    if (value.advancedConfig) {
        var restored = JSON.parse(JSON.stringify(value.advancedConfig));

        // Always sync the asset to the current selection in case the user
        // changed the video between Advanced sessions.
        if (!restored.formValues) restored.formValues = {};
        if (!restored.formValues.video) restored.formValues.video = {};
        restored.formValues.video.asset = {
            public_id: asset.public_id,
            format:    asset.format    || '',
            derived:   asset.derived   || []
        };

        // Ensure formValues.video.transStr is populated for the iframe preview.
        // New saves already have it set (injected in the 'done' handler).
        // For old saves (made before that fix), playerConf was stripped by SFCC
        // storage so it won't be present here — fall back to the widget-level
        // transformationOverride which is preserved in the parent value.
        if (!restored.formValues.video.transStr) {
            if (restored.playerConf) {
                try {
                    var pc = JSON.parse(restored.playerConf);
                    if (pc.transStr) {
                        restored.formValues.video.transStr = pc.transStr;
                    }
                } catch (e) { /* keep empty if playerConf is unparseable */ }
            }
            if (!restored.formValues.video.transStr && value.transformationOverride) {
                restored.formValues.video.transStr = value.transformationOverride;
            }
        }

        return restored;
    }

    // First-time open – no previous Advanced config, start from scratch.
    return {
        formValues: {
            video: {
                asset: {
                    public_id: asset.public_id,
                    format:    asset.format    || '',
                    derived:   asset.derived   || []
                },
                transStr: value.transformationOverride || ''
            }
        }
    };
}

(() => {
    subscribe('sfcc:ready', async ({ value, config }) => {
        console.log('[CLD AdvancedVideo] sfcc:ready raw value:', JSON.stringify(value));
        let iFrame = document.createElement('iframe');
        let iframeValue = normalizeValueForIframe(value);
        console.log('[CLD AdvancedVideo] iframeValue (before dehydrate):', JSON.stringify(iframeValue));
        let dehydrated = cldUtils.dehydrate(iframeValue);
        console.log('[CLD AdvancedVideo] dehydrated (goes into URL):', JSON.stringify(dehydrated));
        let val = encodeURIComponent(JSON.stringify(dehydrated));
        iFrame.src = config.iFrameEnv + '/video?cloudName=' + config.cloudName + '&value=' + val;
        iFrame.id = 'video-form';
        iFrame.setAttribute('frameborder', 0);
        iFrame.setAttribute('marginwidth', 0);
        iFrame.setAttribute('marginheight', 0);
        iFrame.setAttribute('vspace', 0);
        iFrame.setAttribute('hspace', 0);
        iFrame.setAttribute('scrolling', 'no');
        document.body.appendChild(iFrame);
        let ifrm = document.querySelector('iframe');
        window.addEventListener('message', (event) => {
            if (event.origin === config.iFrameEnv) {
                // Pass iframeValue (old-format shape) so the 'ready' handler
                // posts back data the iframe can actually parse for its UI.
                handleIframeMessage(event.data, ifrm, iframeValue, config);
            }
        });
        parentIFrame.getPageInfo((i) => {
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const headerHeight = 61;
            const footerHeight = 61;
            // We remove - 6rem padding, header & footer
            iFrame.height = i.clientHeight - (6 * rem) - headerHeight - footerHeight;
        });
        // iFrameResize({heightCalculationMethod: 'taggedElement' }, '#video-form');
    });
})();

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
        case 'ready':
            value.origin = 'ready';
            console.log('[CLD AdvancedVideo] posting ready value to iframe:', JSON.stringify(value));
            ifrm.contentWindow.postMessage(value, '*');
            break;
        case 'done':
            delete message.action;
            var val = Object.assign({}, message);
            // playerConf.transStr is the authoritative transformation string.
            // formValues.video.transStr is always empty in the iframe's done
            // payload.  SFCC strips every top-level key except formValues/
            // breakpoints before delivering the value to the parent breakout
            // callback, so playerConf itself disappears after storage.
            // Inject transStr into formValues.video NOW, while playerConf is
            // still available locally, so it survives the round-trip.
            if (val.playerConf) {
                try {
                    var doneConf = JSON.parse(val.playerConf);
                    if (doneConf.transStr) {
                        if (!val.formValues) val.formValues = {};
                        if (!val.formValues.video) val.formValues.video = {};
                        val.formValues.video.transStr = doneConf.transStr;
                    }
                } catch (e) { /* keep as-is on parse error */ }
            }
            emit({
                type: 'sfcc:value',
                payload: val
            });
            break;
        }
    }
};

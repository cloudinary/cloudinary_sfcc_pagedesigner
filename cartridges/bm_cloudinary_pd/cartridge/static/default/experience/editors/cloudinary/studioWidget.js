/**
 * studioWidget.js - SFCC Page Designer breakout editor
 *
 * Uses the official Cloudinary Studio Widget JS SDK:
 * https://studio-widget.cloudinary.com/latest/all.js
 */

(() => {
    subscribe('sfcc:ready', function ({ value, config }) {
        // Capture emit at subscribe time - stable reference across async callbacks
        var _emit = emit;

        // Container the SDK will mount the widget into
        var container = document.createElement('div');
        container.id = 'cld-studio-container';
        document.body.appendChild(container);

        // Size the container to fill the modal viewport
        parentIFrame.getPageInfo(function (info) {
            var rem    = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            var chrome = 55 + 55 + (4 * rem);
            var h      = Math.max(Math.round(info.clientHeight - chrome), 400);

            container.style.width  = '100%';
            container.style.height = '100%';
            parentIFrame.size(h);

            initWidget(_emit);
        });

        function showInsertSuccess() {
            var existing = document.getElementById('cld-insert-msg');
            if (existing) existing.parentNode.removeChild(existing);

            var insertBtn = null;
            var btns = document.querySelectorAll('button');
            for (var i = 0; i < btns.length; i++) {
                if (btns[i].textContent.trim().toLowerCase() === 'insert') {
                    insertBtn = btns[i];
                    break;
                }
            }

            var msg = document.createElement('div');
            msg.id = 'cld-insert-msg';

            if (insertBtn) {
                var rect = insertBtn.getBoundingClientRect();
                msg.style.cssText = [
                    'position:fixed',
                    'top:' + (rect.bottom + 8) + 'px',
                    'left:' + (rect.left + rect.width / 2) + 'px',
                    'transform:translateX(-50%)',
                    'display:inline-flex', 'align-items:center', 'gap:8px',
                    'background:#0f172a', 'color:#f8fafc',
                    'font-family:system-ui,sans-serif', 'font-size:13px', 'font-weight:500',
                    'padding:10px 18px', 'border-radius:8px',
                    'box-shadow:0 4px 16px rgba(0,0,0,0.25)',
                    'z-index:99999', 'pointer-events:none',
                    'white-space:nowrap',
                    'animation:cld-fadein 0.2s ease'
                ].join(';');
            } else {
                msg.style.cssText = [
                    'position:fixed', 'top:60px', 'right:16px',
                    'display:inline-flex', 'align-items:center', 'gap:8px',
                    'background:#0f172a', 'color:#f8fafc',
                    'font-family:system-ui,sans-serif', 'font-size:13px', 'font-weight:500',
                    'padding:10px 18px', 'border-radius:8px',
                    'box-shadow:0 4px 16px rgba(0,0,0,0.25)',
                    'z-index:99999', 'pointer-events:none',
                    'white-space:nowrap',
                    'animation:cld-fadein-right 0.2s ease'
                ].join(';');
            }

            msg.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"' +
                ' fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<polyline points="20 6 9 17 4 12"/></svg>' +
                "Already inserted. Click 'Apply' to sync your edits.";

            if (!document.getElementById('cld-insert-msg-style')) {
                var style = document.createElement('style');
                style.id = 'cld-insert-msg-style';
                style.textContent =
                    '@keyframes cld-fadein{from{opacity:0;transform:translateX(-50%) translateY(-4px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}' +
                    '@keyframes cld-fadein-right{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}';
                document.head.appendChild(style);
            }

            document.body.appendChild(msg);
            setTimeout(function () { if (msg.parentNode) msg.parentNode.removeChild(msg); }, 4000);
        }

        function initWidget(emitFn) {
            var widget = window.cloudinary.studioWidget({
                cloudName: config.cloudName,
                apiKey:    config.apiKey,
                appendTo:  '#cld-studio-container',
                featureConfig: {
                    hideCloseButton: true
                }
            });

            var publicId = getPublicId(value);
            var transformation = getTransformation(value);
            if (publicId || transformation) {
                var updateOpts = {};
                if (publicId) updateOpts.publicIds = [publicId];
                if (transformation) updateOpts.transformation = transformation;
                widget.update(updateOpts);
            }

            widget.on('insert', function (payload) {
                try {
                    var imageUrl = '';
                    var publicId = '';
                    var trans    = '[]';

                    if (typeof payload === 'string') {
                        imageUrl = payload;
                        var parsed = parseCloudinaryUrl(payload);
                        publicId   = parsed.publicId;
                        trans      = parsed.transformation;
                    } else {
                        var asset = Array.isArray(payload?.assets) && payload.assets.length
                            ? payload.assets[0]
                            : Array.isArray(payload) && payload.length
                                ? payload[0]
                                : payload;
                        imageUrl = asset?.url || asset?.imageUrl || asset?.secure_url || '';
                        publicId = asset?.public_id || asset?.publicId || '';
                        trans    = asset?.transformation || asset?.eager_transformation || '[]';
                        if (typeof trans !== 'string') {
                            try { trans = JSON.stringify(trans); } catch (e) { trans = '[]'; }
                        }
                    }

                    var result = {
                        formValues: {
                            studioResult: {
                                imageUrl:                 imageUrl,
                                transformation:           trans,
                                public_id:                publicId,
                                isTransformationOverride: true
                            }
                        }
                    };

                    emitFn({ type: 'sfcc:value', payload: result });
                    showInsertSuccess();

                } catch (err) {
                    console.error('[CLD Studio] insert handler error:', err);
                }
            });

            widget.show({resetState: true});

            window.addEventListener('pagehide', function () {
                try { widget.destroy(); } catch (e) {}
            });
        }
    });

    function getPublicId(value) {
        var fv = value?.formValues;
        if (!fv) return '';
        var entry = fv.desktop || fv.tablet || fv.mobile;
        return entry?.asset?.public_id || fv.image?.asset?.public_id || '';
    }

    function getTransformation(value) {
        var overrides = value && value.transformationOverrides;
        if (overrides) {
            var trans = overrides.desktop || overrides.tablet || overrides.mobile;
            if (trans) return trans;
        }
        if (value && value.transformationOverride) return value.transformationOverride;
        var sr = value && value.formValues && value.formValues.studioResult;
        if (sr && sr.transformation && sr.transformation !== '[]') return sr.transformation;
        return '';
    }

    /**
     * Parse a Cloudinary delivery URL into its transformation string and public_id.
     */
    function parseCloudinaryUrl(url) {
        var UPLOAD = '/upload/';
        var idx = url.indexOf(UPLOAD);
        if (idx === -1) return { publicId: '', transformation: '[]' };

        var afterUpload = url.substring(idx + UPLOAD.length).split('?')[0];
        var segments    = afterUpload.split('/');

        var transParts = [];
        var pidParts   = [];
        var inPid      = false;

        for (var seg of segments) {
            if (!inPid && isTransformSegment(seg)) {
                transParts.push(seg);
            } else {
                inPid = true;
                pidParts.push(seg);
            }
        }

        // Strip file extension from the last public_id segment
        var last   = pidParts[pidParts.length - 1] || '';
        var dotIdx = last.lastIndexOf('.');
        if (dotIdx !== -1) pidParts[pidParts.length - 1] = last.substring(0, dotIdx);

        return {
            publicId:       pidParts.join('/'),
            transformation: transParts.length ? transParts.join('/') : '[]'
        };
    }

    function isTransformSegment(seg) {
        var parts = seg.split(',');
        return parts.every(function (p) {
            return /^[a-z]{1,3}_/.test(p) || /^[a-z]{1,3}[A-Z]/.test(p);
        });
    }
})();

/**
 * studioWidget.js  –  SFCC Page Designer breakout editor
 *
 * Uses the official Cloudinary Studio Widget JS SDK:
 * https://studio-widget.cloudinary.com/latest/all.js
 */

(() => {
    subscribe('sfcc:ready', function ({ value, config }) {
        // Capture emit at subscribe time — stable reference across async callbacks
        var _emit = emit;

        // Container the SDK will mount the widget into
        var container = document.createElement('div');
        container.id = 'cld-studio-container';
        document.body.appendChild(container);

        // Size the container to fill the modal viewport
        parentIFrame.getPageInfo(function (info) {
            var rem    = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            var chrome = 55 + 55 + (4 * rem);
            var h      = Math.max(Math.round(info.clientHeight - chrome), 400);

            container.style.width  = '100%';
            container.style.height = h + 'px';
            parentIFrame.size(h);

            initWidget(_emit);
        });

        // ------------------------------------------------------------------
        // Widget initialisation
        // ------------------------------------------------------------------
        function initWidget(emitFn) {
            var widget = window.cloudinary.studioWidget({
                cloudName: config.cloudName,
                apiKey:    config.apiKey,
                appendTo:  '#cld-studio-container'
            });

            var publicId = getPublicId(value);
            if (publicId) {
                widget.update({ publicIds: [publicId] });
            }

            widget.show();

            // Destroy the widget cleanly when SFCC closes the breakout modal
            window.addEventListener('pagehide', function () {
                try { widget.destroy(); } catch (e) {}
            });

            // ── insert ────────────────────────────────────────────────────
            widget.on('insert', function (payload) {
                console.log('[CLD Studio] raw insert payload:', payload);

                try {
                    var imageUrl = '';
                    var publicId = '';
                    var trans    = '[]';

                    if (typeof payload === 'string') {
                        // SDK delivers the final delivery URL as a plain string
                        imageUrl = payload;
                        var parsed = parseCloudinaryUrl(payload);
                        publicId   = parsed.publicId;
                        trans      = parsed.transformation;
                    } else {
                        // Future-proof: handle object payload
                        var asset = payload;
                        if (payload && Array.isArray(payload.assets) && payload.assets.length) {
                            asset = payload.assets[0];
                        } else if (Array.isArray(payload) && payload.length) {
                            asset = payload[0];
                        }
                        imageUrl = asset.url || asset.imageUrl || asset.secure_url || '';
                        publicId = asset.public_id || asset.publicId || '';
                        trans    = asset.transformation || asset.eager_transformation || '[]';
                        if (typeof trans !== 'string') {
                            try { trans = JSON.stringify(trans); } catch (e) { trans = '[]'; }
                        }
                    }

                    var result = {
                        formValues: {
                            studioResult: {
                                imageUrl:                imageUrl,
                                transformation:          trans,
                                public_id:               publicId,
                                isTransformationOverride: true
                            }
                        }
                    };

                    emitFn({ type: 'sfcc:value', payload: result });

                    // Close the breakout modal by programmatically clicking
                    // SFCC's "Apply" button in the parent frame
                    setTimeout(function () {
                        try {
                            var buttons = window.parent.document.querySelectorAll('button');
                            for (var b = 0; b < buttons.length; b++) {
                                if (buttons[b].textContent.trim() === 'Apply') {
                                    buttons[b].click();
                                    break;
                                }
                            }
                        } catch (e) { /* cross-origin guard */ }
                    }, 50);

                } catch (err) {
                    console.error('[CLD Studio] insert handler error:', err);
                }
            });

            widget.on('close', function () {
                console.log('[CLD Studio] widget closed by user');
            });
        }
    });

    function getPublicId(value) {
        if (!value || !value.formValues) return '';
        var fv = value.formValues;
        var entry = fv.desktop || fv.tablet || fv.mobile;
        if (entry && entry.asset && entry.asset.public_id) return entry.asset.public_id;
        if (fv.image && fv.image.asset && fv.image.asset.public_id) return fv.image.asset.public_id;
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

        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i];
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

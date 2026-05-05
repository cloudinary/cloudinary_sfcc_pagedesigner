(() => {
    var state = {
        formValues:            { mobile: null, tablet: null, desktop: null },
        transformationOverrides: { mobile: '', tablet: '', desktop: '' },
        activeFormFactor: 'desktop',
        config: null,
        ml: null
    };

    var FORM_FACTORS = ['mobile', 'tablet', 'desktop'];
    var TAB_ORDER    = ['desktop', 'mobile', 'tablet'];

    // ── Inheritance ──────────────────────────────────────────────────────

    function resolveAsset(formFactor) {
        if (state.formValues[formFactor]) return state.formValues[formFactor];
        for (var i = 0; i < FORM_FACTORS.length; i++) {
            if (state.formValues[FORM_FACTORS[i]]) return state.formValues[FORM_FACTORS[i]];
        }
        return null;
    }

    function isInherited(formFactor) {
        return !state.formValues[formFactor] && !!resolveAsset(formFactor);
    }

    // ── URL builders ─────────────────────────────────────────────────────

    function buildDeliveryUrl(asset) {
        if (!asset || !asset.public_id) return '';
        var cname = state.config.cname;
        var base = cname
            ? 'https://' + cname.replace(/^https?:\/\//, '')
            : 'https://res.cloudinary.com/' + state.config.cloudName;
        var ext = asset.format ? '.' + asset.format : '';
        return base + '/' + (asset.resource_type || 'image') + '/upload/' + asset.public_id + ext;
    }

    function buildThumbnailUrl(asset) {
        if (!asset || !asset.public_id) return '';
        var cloudName = asset.cloudName || state.config.cloudName;
        var publicId = asset.public_id.replace(/\.[^/.]+$/, '');
        return 'https://res.cloudinary.com/' + cloudName +
            '/image/upload/w_400,h_160,c_fill,q_auto,f_jpg/' + publicId + '.jpg';
    }

    // ── SFCC emit ────────────────────────────────────────────────────────

    function emitToSFCC() {
        var hasAny = FORM_FACTORS.some(function (ff) { return !!state.formValues[ff]; });
        emit({ type: 'sfcc:valid', payload: { valid: hasAny } });
        emit({
            type: 'sfcc:value',
            payload: hasAny ? {
                formValues:            state.formValues,
                transformationOverrides: state.transformationOverrides
            } : null
        });
    }

    // ── Viewport → form factor ───────────────────────────────────────────

    function toFormFactor(viewport) {
        if (!viewport) return 'desktop';
        if (viewport.breakpoint) {
            var bp = viewport.breakpoint.toLowerCase();
            if (bp === 'mobile' || bp === 'tablet' || bp === 'desktop') return bp;
        }
        var w = viewport.width || 1024;
        if (w <= 767) return 'mobile';
        if (w <= 1023) return 'tablet';
        return 'desktop';
    }

    // ── Initial value ────────────────────────────────────────────────────

    function parseInitialValue(value) {
        if (!value) return;
        if (!value.formValues) return;
        var fv = value.formValues;

        // New per-form-factor format
        if (fv.mobile !== undefined || fv.tablet !== undefined || fv.desktop !== undefined) {
            state.formValues.mobile  = fv.mobile  || null;
            state.formValues.tablet  = fv.tablet  || null;
            state.formValues.desktop = fv.desktop || null;

            // Restore per-device overrides (new map format)
            if (value.transformationOverrides) {
                FORM_FACTORS.forEach(function (ff) {
                    state.transformationOverrides[ff] = value.transformationOverrides[ff] || '';
                });
                return;
            }

            // Backward compat: single global transformationOverride → copy to all entries
            var legacyOverride = value.transformationOverride ||
                (value.studioConfig &&
                 value.studioConfig.transformation &&
                 value.studioConfig.transformation !== '[]'
                    ? value.studioConfig.transformation : '');

            if (legacyOverride) {
                FORM_FACTORS.forEach(function (ff) {
                    if (state.formValues[ff]) {
                        state.transformationOverrides[ff] = legacyOverride;
                    }
                });
            }
            return;
        }

        // Legacy image.asset format → mobile slot
        if (fv.image && fv.image.asset) {
            var asset = Object.assign({}, fv.image.asset, { cloudName: state.config.cloudName });
            state.formValues.mobile = { asset: asset, url: buildDeliveryUrl(asset) };
        }
    }

    // ── Cloudinary MLW – SFCC breakout ───────────────────────────────────

    function openMediaPicker() {
        emit(
            {
                type: 'sfcc:breakout',
                payload: { id: 'mediaPicker', title: 'Cloudinary Image' }
            },
            function (data) {
                if (data && data.value) {
                    var asset = Object.assign({}, data.value, { cloudName: state.config.cloudName });
                    var url = buildDeliveryUrl(asset);
                    state.formValues[state.activeFormFactor] = { asset: asset, url: url };
                    render();
                    emitToSFCC();
                }
            }
        );
    }

    // ── Render ───────────────────────────────────────────────────────────

    function render() {
        var root = document.getElementById('cld-widget-root');
        if (!root) return;
        root.innerHTML = buildHTML();
        bindEvents();
    }

    function buildHTML() {
        return buildTabsHTML() + buildPickerHTML() + buildFileRowHTML() + buildAdvancedSectionHTML();
    }

    function buildTabsHTML() {
        var html = '<div class="cld-ff-tabs" role="tablist">';
        TAB_ORDER.forEach(function (ff) {
            var isActive     = ff === state.activeFormFactor;
            var hasSelection = !!state.formValues[ff];
            var label        = ff.charAt(0).toUpperCase() + ff.slice(1);
            html += '<button role="tab" type="button" ' +
                'class="cld-ff-tab' + (isActive ? ' active' : '') + '" ' +
                'data-ff="' + ff + '" ' +
                'aria-selected="' + isActive + '" ' +
                'title="' + label + (hasSelection ? ' \u2013 selection set' : ' \u2013 no selection') + '">' +
                label +
                (hasSelection ? '<span class="cld-ff-tab-dot" aria-hidden="true"></span>' : '') +
                '</button>';
        });
        html += '</div>';
        return html;
    }

    function buildPickerHTML() {
        var entry     = resolveAsset(state.activeFormFactor);
        var asset     = entry ? entry.asset : null;
        var hasAsset  = !!asset;
        var inherited = isInherited(state.activeFormFactor);

        return '<button type="button" id="cld-picker-btn" ' +
            'class="cld-picker' + (hasAsset ? ' has-asset' : '') + '" ' +
            'aria-label="' + (hasAsset ? 'Change selected image' : 'Select image from Cloudinary') + '">' +
            (hasAsset ? '<img class="cld-picker-thumb" src="' + buildThumbnailUrl(asset) + '" alt="" aria-hidden="true">' : '') +
            (inherited ? '<span class="cld-picker-badge cld-picker-badge--inherited">Inherited</span>' : '') +
            (hasAsset && !inherited ? '<span class="cld-picker-badge cld-picker-badge--type">IMAGE</span>' : '') +
            '<span class="cld-picker-overlay">' +
            '<span>' + (hasAsset ? 'Change image' : 'Select image') + '</span>' +
            '</span>' +
            '</button>';
    }

    function buildFileRowHTML() {
        var entry     = resolveAsset(state.activeFormFactor);
        var asset     = entry ? entry.asset : null;
        var publicId  = asset ? asset.public_id : '';

        return '<div class="cld-file-row">' +
            '<input type="text" class="cld-file-input" readonly ' +
            'value="' + (publicId || '') + '" ' +
            'placeholder="No image selected" ' +
            'aria-label="Selected asset public ID" ' +
            'title="' + (publicId || 'No image selected') + '">' +
            '<button type="button" class="cld-file-btn" id="cld-browse-btn" title="Browse">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
            '<path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>' +
            '</svg>' +
            '</button>' +
            (publicId
                ? '<button type="button" class="cld-file-btn cld-file-btn--clear" id="cld-clear-btn" title="Clear">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
                  '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>' +
                  '</svg>' +
                  '</button>'
                : '') +
            '</div>';
    }

    function buildAdvancedSectionHTML() {
        var override    = state.transformationOverrides[state.activeFormFactor] || '';
        var hasOverride = !!override;

        return '<div class="cld-section cld-section--advanced">' +
            '<button type="button" id="cld-advanced-btn" class="cld-advanced-btn"' +
            (hasOverride ? ' disabled aria-disabled="true"' : '') +
            '>Advanced</button>' +
            '<div class="cld-adv-override">' +
            '<label class="cld-adv-override-label" for="cld-trans-override">' +
            'Transformation override (advanced)' +
            '</label>' +
            '<textarea id="cld-trans-override" class="cld-adv-override-input" rows="3" ' +
            'placeholder="Transformation parameters in URL syntax">' +
            (override || '') +
            '</textarea>' +
            '</div>' +
            '</div>';
    }

    // ── Studio Widget breakout ────────────────────────────────────────────

    function openStudioWidget() {
        var ff = state.activeFormFactor;
        emit(
            {
                type: 'sfcc:breakout',
                payload: { id: 'studioWidget', title: 'Cloudinary Studio Widget' }
            },
            function (data) {
                console.log('[imageFormWidget] studioWidget callback:', JSON.stringify(data));
                var val = data && data.value;
                if (!val) return;

                var studioResult = (val.formValues && val.formValues.studioResult)
                                || val.studioResult
                                || null;
                if (!studioResult) return;

                var trans    = studioResult.transformation;
                var override = (trans && trans !== '[]') ? trans : '';

                state.transformationOverrides[ff] = override;
                render();
                emitToSFCC();
            }
        );
    }

    // ── Event binding ────────────────────────────────────────────────────

    function bindEvents() {
        document.querySelectorAll('.cld-ff-tab').forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.activeFormFactor = btn.getAttribute('data-ff');
                render();
            });
        });

        var pickerBtn = document.getElementById('cld-picker-btn');
        if (pickerBtn) pickerBtn.addEventListener('click', openMediaPicker);

        var browseBtn = document.getElementById('cld-browse-btn');
        if (browseBtn) browseBtn.addEventListener('click', openMediaPicker);

        var advBtn = document.getElementById('cld-advanced-btn');
        if (advBtn) {
            advBtn.addEventListener('click', function () {
                if (!advBtn.disabled) openStudioWidget();
            });
        }

        // Transformation override textarea — stored per active form factor
        var transInput = document.getElementById('cld-trans-override');
        if (transInput) {
            transInput.addEventListener('input', function () {
                var val = transInput.value.trim();
                state.transformationOverrides[state.activeFormFactor] = val;
                var btn = document.getElementById('cld-advanced-btn');
                if (btn) {
                    btn.disabled = !!val;
                    btn.setAttribute('aria-disabled', String(!!val));
                }
                emitToSFCC();
            });
        }

        var clearBtn = document.getElementById('cld-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (state.formValues[state.activeFormFactor]) {
                    state.formValues[state.activeFormFactor] = null;
                } else {
                    for (var i = 0; i < FORM_FACTORS.length; i++) {
                        if (state.formValues[FORM_FACTORS[i]]) {
                            state.formValues[FORM_FACTORS[i]] = null;
                            break;
                        }
                    }
                }
                render();
                emitToSFCC();
            });
        }
    }

    // ── Bootstrap ────────────────────────────────────────────────────────

    subscribe('sfcc:ready', function (opts) {
        state.config = opts.config;
        state.activeFormFactor = toFormFactor(opts.viewport);
        parseInitialValue(opts.value);

        var root = document.createElement('div');
        root.id = 'cld-widget-root';
        document.body.appendChild(root);
        render();
        emitToSFCC();
    });

    subscribe('sfcc:viewport', function (viewport) {
        state.activeFormFactor = toFormFactor(viewport);
        render();
    });
})();

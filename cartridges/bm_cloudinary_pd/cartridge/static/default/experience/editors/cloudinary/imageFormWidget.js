(() => {
    var state = {
        formValues:            { mobile: null, tablet: null, desktop: null },
        transformationOverrides: { mobile: '', tablet: '', desktop: '' },
        activeFormFactor: 'desktop',
        config: null,
        ml: null,
        extraFields: {}  // unmanaged fields from original value carried through on re-save
    };

    var FORM_FACTORS = CldFormFactorUtils.FORM_FACTORS;
    var TAB_ORDER    = CldFormFactorUtils.TAB_ORDER;

    function resolveAsset(formFactor) {
        return CldFormFactorUtils.resolveAsset(state.formValues, formFactor);
    }

    function isInherited(formFactor) {
        return CldFormFactorUtils.isInherited(state.formValues, formFactor);
    }

    function buildDeliveryUrl(asset) {
        return CldFormFactorUtils.buildDeliveryUrl(asset, state.config);
    }

    function buildThumbnailUrl(asset) {
        return CldFormFactorUtils.buildThumbnailUrl(asset, state.config);
    }

    // SFCC emit

    function emitToSFCC() {
        var hasAny = FORM_FACTORS.some(function (ff) { return !!state.formValues[ff]; });
        emit({ type: 'sfcc:valid', payload: { valid: hasAny } });
        emit({
            type: 'sfcc:value',
            payload: hasAny ? Object.assign({}, state.extraFields, {
                formValues:              state.formValues,
                transformationOverrides: state.transformationOverrides
            }) : null
        });
    }

    // Viewport to form factor

    function toFormFactor(viewport) {
        return CldFormFactorUtils.toFormFactor(viewport, state.config && state.config.breakpoints);
    }

    // Initial value

    var MANAGED_FIELDS = ['formValues', 'transformationOverrides', 'transformationOverride', 'studioConfig'];

    function parseInitialValue(value) {
        if (!value) return;

        // Carry through any fields the widget doesn't manage (e.g. accessibility, link)
        Object.keys(value).forEach(function (k) {
            if (MANAGED_FIELDS.indexOf(k) === -1) state.extraFields[k] = value[k];
        });

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

            // Backward compat: single global transformationOverride - copy to all entries
            var legacyOverride = value.transformationOverride ||
                (value.studioConfig?.transformation && value.studioConfig.transformation !== '[]'
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

        // Legacy image.asset format - mobile slot
        if (fv.image && fv.image.asset) {
            var asset = Object.assign({}, fv.image.asset, { cloudName: state.config.cloudName });
            state.formValues.mobile = { asset: asset, url: buildDeliveryUrl(asset) };
        }
    }

    // Cloudinary MLW - SFCC breakout

    function openMediaPicker() {
        emit(
            {
                type: 'sfcc:breakout',
                payload: { id: 'mediaPicker', title: 'Cloudinary Image' }
            },
            function (data) {
                if (data?.value) {
                    var asset = Object.assign({}, data.value, { cloudName: state.config.cloudName });
                    var url = buildDeliveryUrl(asset);

                    if (asset.derived && asset.derived.length > 0 && asset.derived[0].raw_transformation) {
                        state.transformationOverrides[state.activeFormFactor] = asset.derived[0].raw_transformation;
                    }

                    state.formValues[state.activeFormFactor] = { asset: asset, url: url };
                    render();
                    emitToSFCC();
                }
            }
        );
    }

    // Render

    function render() {
        CldFormFactorUtils.render(buildHTML, bindEvents);
    }

    function buildHTML() {
        return buildTabsHTML() + buildPickerHTML() + buildFileRowHTML() + buildAdvancedSectionHTML();
    }

    function buildTabsHTML() {
        return CldFormFactorUtils.buildTabsHTML(state.activeFormFactor, state.formValues);
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
            (hasAsset && !inherited ? '<span class="cld-picker-badge cld-picker-badge--type">Original Image</span>' : '') +
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

    // Studio Widget breakout

    function openStudioWidget() {
        var ff = state.activeFormFactor;
        emit(
            {
                type: 'sfcc:breakout',
                payload: { id: 'studioWidget', title: 'Cloudinary Studio Widget' }
            },
            function (data) {
                var val = data && data.value;
                if (!val) return;

                var studioResult = (val.formValues && val.formValues.studioResult)
                                || val.studioResult
                                || null;
                if (!studioResult) return;

                var trans    = studioResult.transformation;
                var override = (trans && trans !== '[]') ? trans : '';
                var pid      = studioResult.public_id;

                state.transformationOverrides[ff] = override;

                if (pid) {
                    var asset = { public_id: pid, cloudName: state.config.cloudName };
                    state.formValues[ff] = { asset: asset, url: buildDeliveryUrl(asset) };
                }

                render();
                emitToSFCC();
            }
        );
    }

    // Event binding

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
            advBtn.removeAttribute('disabled');
            advBtn.removeAttribute('aria-disabled');
            advBtn.addEventListener('click', function () {
                openStudioWidget();
            });
        }

        // Transformation override textarea - stored per active form factor
        var transInput = document.getElementById('cld-trans-override');
        if (transInput) {
            transInput.addEventListener('input', function () {
                var val = transInput.value.trim();
                state.transformationOverrides[state.activeFormFactor] = val;
                emitToSFCC();
            });
        }

        var clearBtn = document.getElementById('cld-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (state.formValues[state.activeFormFactor]) {
                    state.formValues[state.activeFormFactor] = null;
                } else {
                    for (var ff of FORM_FACTORS) {
                        if (state.formValues[ff]) {
                            state.formValues[ff] = null;
                            break;
                        }
                    }
                }
                render();
                emitToSFCC();
            });
        }
    }

    // Bootstrap

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

    listen('sfcc:value', function (value) {
        state.formValues      = { mobile: null, tablet: null, desktop: null };
        state.transformationOverrides = { mobile: '', tablet: '', desktop: '' };
        state.extraFields     = {};
        parseInitialValue(value);
        render();
    });
})();

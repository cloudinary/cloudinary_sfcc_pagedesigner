(() => {
    var state = {
        formValues: { mobile: null, tablet: null, desktop: null },
        activeFormFactor: 'desktop',
        config: null,
        ml: null,
        posterMode: 'auto',  // 'auto' | 'first_frame'
        playerOptions: { autoplay: false, muted: false, loop: false, controls: true },
        transformationOverride: '',  // manual URL-syntax override; mutually exclusive with Advanced
        advancedConfig: null         // full 'done' payload from the Advanced breakout
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
            payload: hasAny ? {
                formValues: state.formValues,
                posterMode: state.posterMode,
                playerOptions: state.playerOptions,
                transformationOverride: state.transformationOverride,
                advancedConfig: state.advancedConfig
            } : null
        });
    }

    // Viewport -> form factor

    function toFormFactor(viewport) {
        return CldFormFactorUtils.toFormFactor(viewport, state.config?.breakpoints);
    }

    // Initial value

    function parseInitialValue(value) {
        if (!value) return;

        // Restore poster mode, player options and transformation override if previously saved
        if (value.posterMode) {
            state.posterMode = value.posterMode;
        }
        if (value.playerOptions) {
            state.playerOptions = Object.assign({}, state.playerOptions, value.playerOptions);
        }
        if (value.transformationOverride) {
            state.transformationOverride = value.transformationOverride;
        }
        if (value.advancedConfig) {
            state.advancedConfig = value.advancedConfig;
        }

        if (!value.formValues) return;
        var fv = value.formValues;

        // New per-form-factor format
        if (fv.mobile !== undefined || fv.tablet !== undefined || fv.desktop !== undefined) {
            state.formValues.mobile = fv.mobile || null;
            state.formValues.tablet = fv.tablet || null;
            state.formValues.desktop = fv.desktop || null;
            return;
        }

        // Legacy format: migrate video.asset -> mobile slot
        if (fv.video?.asset) {
            var asset = Object.assign({}, fv.video.asset, { cloudName: state.config.cloudName });
            state.formValues.mobile = { asset: asset, url: buildDeliveryUrl(asset) };
        }
    }

    // Cloudinary MLW - SFCC breakout

    function openMediaPicker() {
        emit(
            {
                type: 'sfcc:breakout',
                payload: { id: 'mediaPicker', title: 'Cloudinary Video' }
            },
            function (data) {
                if (data?.value) {
                    var asset = Object.assign({}, data.value, { cloudName: state.config.cloudName });
                    var url = buildDeliveryUrl(asset);
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
        return (
            buildTabsHTML() +
            buildPickerHTML() +
            buildFileRowHTML() +
            buildPosterSectionHTML() +
            buildPlayerOptionsSectionHTML() +
            buildAdvancedSectionHTML()
        );
    }

    function buildPosterSectionHTML() {
        var isFirstFrame = state.posterMode === 'first_frame';
        return '<div class="cld-section">' +
            '<div class="cld-section-title">Poster image</div>' +
            '<label class="cld-radio-label">' +
            '<input type="radio" name="cld-poster" value="auto"' + (!isFirstFrame ? ' checked' : '') + '>' +
            ' Auto' +
            '</label>' +
            '<label class="cld-radio-label">' +
            '<input type="radio" name="cld-poster" value="first_frame"' + (isFirstFrame ? ' checked' : '') + '>' +
            ' First frame' +
            '</label>' +
            '</div>';
    }

    function buildPlayerOptionsSectionHTML() {
        var opts = state.playerOptions;
        var items = [
            { key: 'autoplay',  label: 'Autoplay' },
            { key: 'muted',     label: 'Start muted' },
            { key: 'loop',      label: 'Loop' },
            { key: 'controls',  label: 'Show controls' }
        ];
        var html = '<div class="cld-section">' +
            '<div class="cld-section-title">Player options</div>';
        for (var item of items) {
            html += '<label class="cld-checkbox-label">' +
                '<input type="checkbox" data-opt="' + item.key + '"' + (opts[item.key] ? ' checked' : '') + '>' +
                ' ' + item.label +
                '</label>';
        }
        html += '</div>';
        return html;
    }

    function buildTabsHTML() {
        return CldFormFactorUtils.buildTabsHTML(state.activeFormFactor, state.formValues);
    }

    function buildPickerHTML() {
        var entry = resolveAsset(state.activeFormFactor);
        var asset = entry ? entry.asset : null;
        var hasAsset = !!asset;
        var inherited = isInherited(state.activeFormFactor);
        var isVideo = asset?.resource_type === 'video';

        return '<button type="button" id="cld-picker-btn" ' +
            'class="cld-picker' + (hasAsset ? ' has-asset' : '') + '" ' +
            'aria-label="' + (hasAsset ? 'Change selected media' : 'Select media from Cloudinary') + '">' +
            (hasAsset ? '<img class="cld-picker-thumb" src="' + buildThumbnailUrl(asset) + '" alt="" aria-hidden="true">' : '') +
            (inherited ? '<span class="cld-picker-badge cld-picker-badge--inherited">Inherited</span>' : '') +
            (hasAsset && !inherited ? '<span class="cld-picker-badge cld-picker-badge--type">' + (isVideo ? 'VIDEO' : 'IMAGE') + '</span>' : '') +
            '<span class="cld-picker-overlay">' +
            '<span>' + (hasAsset ? 'Change ' + (isVideo ? 'video' : 'image') : 'Select media') + '</span>' +
            '</span>' +
            '</button>';
    }

    function buildFileRowHTML() {
        var publicId = resolveAsset(state.activeFormFactor)?.asset?.public_id || '';

        return '<div class="cld-file-row">' +
            '<input type="text" class="cld-file-input" readonly ' +
            'value="' + (publicId || '') + '" ' +
            'placeholder="No media selected" ' +
            'aria-label="Selected asset public ID" ' +
            'title="' + (publicId || 'No media selected') + '">' +
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
        var hasOverride = !!state.transformationOverride;
        return '<div class="cld-section cld-section--advanced">' +
            '<button type="button" id="cld-advanced-btn" class="cld-advanced-btn"' +
            '>Advanced</button>' +
            '<div class="cld-adv-override">' +
            '<label class="cld-adv-override-label" for="cld-trans-override">' +
            'Transformation override (advanced)' +
            '</label>' +
            '<textarea id="cld-trans-override" class="cld-adv-override-input" rows="3" ' +
            'placeholder="Transformation parameters in URL syntax">' +
            (state.transformationOverride ? state.transformationOverride : '') +
            '</textarea>' +
            '</div>' +
            '</div>';
    }

    function openAdvancedConfig() {
        var resolved = resolveAsset(state.activeFormFactor);
        var asset = resolved ? resolved.asset : null;
        // Merge previously saved advanced config so the iframe can restore its state
        var breakoutValue = Object.assign({}, state.advancedConfig || {}, {
            cloudName: state.config.cloudName,
            publicId: asset ? asset.public_id : '',
            transStr: state.transformationOverride || ''
        });
        emit(
            {
                type: 'sfcc:breakout',
                payload: { id: 'advancedConfig', title: 'Cloudinary Video Advanced Configuration', value: breakoutValue }
            },
            function (data) {
                console.log('[CLD Widget] Advanced breakout callback data:', JSON.stringify(data));
                if (data?.value) {
                    var returned = data.value;
                    console.log('[CLD Widget] Advanced returned value:', JSON.stringify(returned));

                    // Store the full payload so the iframe can restore all overlay
                    // settings (font family, size, position, etc.) on re-open.
                    state.advancedConfig = returned;

                    // Extract the transformation string for server-side application.
                    // Priority: formValues.video.transStr (injected in 'done' handler,
                    // survives SFCC storage) > playerConf.transStr (still present in
                    // the raw payload before SFCC strips it) > top-level transStr.
                    var transStr = '';
                    if (returned.formValues?.video?.transStr) {
                        transStr = returned.formValues.video.transStr;
                    } else if (returned.playerConf) {
                        try { transStr = JSON.parse(returned.playerConf).transStr || ''; } catch (e) { /* ignore */ }
                    } else if (typeof returned.transStr === 'string') {
                        transStr = returned.transStr;
                    }
                    state.transformationOverride = transStr;
                    render();
                    emitToSFCC();
                }
            }
        );
    }

    // Event binding

    function bindEvents() {
        // Tab clicks
        document.querySelectorAll('.cld-ff-tab').forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.activeFormFactor = btn.getAttribute('data-ff');
                render();
            });
        });

        // Picker button (thumbnail area)
        var pickerBtn = document.getElementById('cld-picker-btn');
        if (pickerBtn) {
            pickerBtn.addEventListener('click', openMediaPicker);
        }

        // Browse button (folder icon)
        var browseBtn = document.getElementById('cld-browse-btn');
        if (browseBtn) {
            browseBtn.addEventListener('click', openMediaPicker);
        }

        // Advanced button
        var advBtn = document.getElementById('cld-advanced-btn');
        if (advBtn) {
            advBtn.removeAttribute('disabled');
            advBtn.removeAttribute('aria-disabled');
            advBtn.addEventListener('click', function () {
                openAdvancedConfig();
            });
        }

        // Transformation override textarea - disables Advanced while it has a value
        var transInput = document.getElementById('cld-trans-override');
        if (transInput) {
            transInput.addEventListener('input', function () {
                state.transformationOverride = transInput.value.trim();
                emitToSFCC();
            });
        }

        // Poster image radios
        document.querySelectorAll('input[name="cld-poster"]').forEach(function (radio) {
            radio.addEventListener('change', function () {
                state.posterMode = radio.value;
                emitToSFCC();
            });
        });

        // Player option checkboxes
        document.querySelectorAll('input[data-opt]').forEach(function (cb) {
            cb.addEventListener('change', function () {
                state.playerOptions[cb.getAttribute('data-opt')] = cb.checked;
                emitToSFCC();
            });
        });

        // Clear button (trash icon)
        var clearBtn = document.getElementById('cld-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                // If this slot has its own value, clear it directly.
                // If it's inherited, clear the source slot instead.
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
        var value = opts.value;
        var config = opts.config;
        var viewport = opts.viewport;

        state.config = config;
        state.activeFormFactor = toFormFactor(viewport);

        // Seed player option defaults from site preference (passed via editor.configuration)
        if (config?.playerOptions) {
            try {
                var prefDefaults = JSON.parse(config.playerOptions);
                state.playerOptions = Object.assign({}, state.playerOptions, prefDefaults);
            } catch (e) { /* keep hard-coded defaults */ }
        }

        parseInitialValue(value);

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

(() => {
    // Page Designer ready event

    /**
     * get the html for error messages
     * @param {string} errorText the error text
     * @returns {ChildNode} html
     */
    function getErrorToast(errorText) {
        let html = `
      <div class="slds-notify_container slds-is-absolute cld-error">
      <div class="slds-notify slds-notify_toast slds-theme_error" role="status">
      <span class="slds-assistive-text">error</span>
      <span class="slds-icon_container slds-icon-utility-error slds-m-right_small slds-no-flex slds-align-top" title="Error">
      <svg class="slds-icon slds-icon_small" aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="error"><path d="M12 .9C5.9.9.9 5.9.9 12s5 11.1 11.1 11.1 11.1-5 11.1-11.1S18.1.9 12 .9zM3.7 12c0-4.6 3.7-8.3 8.3-8.3 1.8 0 3.5.5 4.8 1.5L5.2 16.8c-1-1.3-1.5-3-1.5-4.8zm8.3 8.3c-1.8 0-3.5-.5-4.8-1.5L18.8 7.2c1 1.3 1.5 3 1.5 4.8 0 4.6-3.7 8.3-8.3 8.3z"/>
      </svg>
      </span>
      <div class="slds-notify__content">
      <h2 class="slds-text-heading_small ">${errorText}</h2>
      </div>
      <div class="slds-notify__close">
      <button class="slds-button slds-button_icon slds-button_icon-inverse" id="btn-close" title="Close">
      <svg class="slds-button__icon slds-button__icon_large" aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="close"><path d="M14.3 11.7l6-6c.3-.3.3-.7 0-1l-.9-1c-.3-.2-.7-.2-1 0l-6 6.1c-.2.2-.5.2-.7 0l-6-6.1c-.3-.3-.7-.3-1 0l-1 1c-.2.2-.2.7 0 .9l6.1 6.1c.2.2.2.4 0 .6l-6.1 6.1c-.3.3-.3.7 0 1l1 1c.2.2.7.2.9 0l6.1-6.1c.2-.2.4-.2.6 0l6.1 6.1c.2.2.7.2.9 0l1-1c.3-.3.3-.7 0-1l-6-6c-.2-.2-.2-.5 0-.7z"/>
      </svg>
      <span class="slds-assistive-text">Close</span>
      </button>
      </div>
      </div>
      </div>`;
        let template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }

    /**
     * gets the html template
     * @param {Object} viewport the viewport
     * @returns {HTMLTemplateElement} html
     */
    function obtainTemplate(viewport) {
        const template = document.createElement('template');
        const height = viewport.height - 16; // 16px = padding top + padding bottom
        template.innerHTML = `<div class="sfcc-ml-root" style="height: ${height}px; max-height: ${height}px;"></div>`;
        return template;
    }

    const showError = (message) => {
        let root = document.getElementsByClassName('sfcc-ml-root')[0];
        let error = getErrorToast(message);
        error.querySelector('#btn-close').addEventListener('click', (e) => {
            root.removeChild(error);
        });
        root.appendChild(error);
    };
    const isAssetRestricted = (assetInfoUrl, asset) => {
        return new Promise((resolve) => {
            fetch(assetInfoUrl + '?publicId=' + asset.public_id + '&type=' + asset.type + '&rType=' + asset.resource_type)
                .then((response) => {
                    if (response.ok) {
                        // eslint-disable-next-line consistent-return
                        response.json().then((data) => {
                            if (data.status === 'ok') {
                                if (data.info.access_control) {
                                    resolve(data.info.access_mode !== 'public'
                        || (data.info.access_control && data.info.access_control[0].access_type !== 'anonymous'));
                                } else {
                                    return resolve(false);
                                }
                            } else {
                                resolve(false);
                            }
                        });
                    } else {
                        resolve(false);
                    }
                });
        });
    };
    subscribe(
        'sfcc:ready', async ({
            value, config, isDisabled, isRequired, dataLocale, displayLocale, viewport, breakout
        }) => {
            console.log(
                'cloudinary.cloudinaryApi::sfcc:ready', dataLocale, displayLocale, isDisabled, isRequired, value, config,
                viewport
            );
            let asset;
            if (value) {
                if (config.imageType === 'overlay') {
                    if (((value.formValues || {}).overlayImage || {}).asset) {
                        asset = value.formValues.overlayImage.asset;
                    }
                } else {
                    asset = config.type === 'image'
                        ? ((value.formValues || {}).image || {}).asset
                        : ((value.formValues || {}).video || {}).asset;
                }
            }
            const template = obtainTemplate(viewport);
            const clone = document.importNode(template.content, true);
            document.body.appendChild(clone);

            // eslint-disable-next-line require-jsdoc
            function insertHandler(data) {
                // eslint-disable-next-line no-shadow
                var asset = (data && data.assets && data.assets.length > 0)
                    ? Object.assign(data.assets[0], { cloudName: config.cloudName })
                    : null;
                if (asset.resource_type !== config.type) {
                    emit({
                        type: 'sfcc:valid',
                        payload: {
                            valid: false,
                            message: 'Wrong asset type.'
                        }
                    });
                    showError('Wrong asset type.');
                } else {
                    isAssetRestricted(config.assetInfoUrl, asset).then(((restricted) => {
                        if (!restricted) {
                            emit({
                                type: 'sfcc:valid',
                                payload: {
                                    valid: true
                                }
                            });
                            emit({
                                type: 'sfcc:value',
                                payload: asset
                            });
                            emit({
                                type: 'sfcc:breakoutApply',
                                payload: breakout
                            });
                        } else {
                            emit({
                                type: 'sfcc:valid',
                                payload: {
                                    valid: false,
                                    message: 'Asset is restricted'
                                }
                            });
                            showError('Asset is restricted');
                        }
                    }),);
                }
            }

            var show = {};
            if (asset && asset.public_id) {
                show.asset = {
                    resource_type: asset.resource_type,
                    type: asset.type,
                    public_id: asset.public_id
                };
            } else {
                show.folder = {
                    resource_type: config.type,
                    path: null
                };
            }

            var ml = cloudinary.createMediaLibrary({
                cloud_name: config.cloudName,
                api_key: config.apiKey,
                remove_header: true,
                inline_container: 'div.sfcc-ml-root',
                max_files: 1,
                multiple: false,
                sandboxAttributes: ['allow-scripts', 'allow-same-origin'],
                integration: {
                    type: 'sfcc_page_designer',
                    platform: 'salesforce_commerce_cloud',
                    version: config.version,
                    environment: config.env
                }
            }, { insertHandler: insertHandler },);
            ml.show(
                show,
            );

            emit({
                type: 'sfcc:valid',
                payload: false
            });
        }
    );
})();

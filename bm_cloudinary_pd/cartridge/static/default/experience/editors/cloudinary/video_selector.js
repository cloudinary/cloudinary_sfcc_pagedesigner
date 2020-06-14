(() => {
	const SECRET_TIMESTAMP = Date.now();

	// Page Designer ready event
	subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale, viewport, breakout }) => {
		console.log('cloudinary.video_selector::sfcc:ready', dataLocale, displayLocale, isDisabled, isRequired, value, config, viewport);
		let asset;
		if (value) {
			if (config.imageType === 'overlay') {
				if (((value.formValues || {}).overlayImage || {}).asset) {
					asset = value.formValues.overlayImage.asset
				}
			} else {
				asset = config.type === 'image' ? ((value.formValues || {}).image || {}).asset : ((value.formValues || {}).video || {}).asset;
			}
		}
		const template = obtainTemplate(viewport);
		const clone = document.importNode(template.content, true);
		document.body.appendChild(clone);
		function insertHandler(data) {
			var asset = (data && data.assets && data.assets.length > 0) ? Object.assign(data.assets[0], { cloudName: config.cloudName }) : null
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
				isAssetRestricted(config.assetInfoUrl, asset).then((restricted => {
					if (!restricted) {
						emit({
							type: 'sfcc:valid',
							payload: {
								valid: true,
							}
						});
						emit({
							type: 'sfcc:value',
							payload: asset
						});
						emit({
							type: 'sfcc:breakoutApply',
							payload: breakout
						})
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
				})
				)
			}
		}

		var show = {};
		if (asset && asset.public_id) {
			show.asset = {
				resource_type: asset.resource_type,
				type: asset.type,
				public_id: asset.public_id
			}
		} else {
			show.folder = {
				resource_type: config.type,
				path: null
			}
		}


		var ml = cloudinary.createMediaLibrary({
			cloud_name: config.cloudName,
			api_key: config.apiKey,
			remove_header: true,
			inline_container: 'div.sfcc-ml-root',
			max_files: 1,
			multiple: false,
			sandboxAttributes: ["allow-scripts", "allow-same-origin"],
			integration: {
				type: "sfcc_page_designer",
				platform: "salesforce_commerce_cloud",
				version: config.version,
				environment: config.env
			}
		}, { insertHandler: insertHandler }
		);
		ml.show(
			show
		);

		emit({
			type: 'sfcc:valid',
			payload: false
		})

	});

	function obtainTemplate(viewport) {
		const template = document.createElement('template');
		const height = viewport.height - 16; // 16px = padding top + padding bottom
		template.innerHTML = `<div class="sfcc-ml-root" style="height: ${height}px; max-height: ${height}px;"></div>`;
		return template;
	}
	const showError = (message) => {
		var root = document.getElementsByClassName('sfcc-ml-root')[0];
		var error = formsEls.htmlToElement(formsEls.getErrorToast(message));
		error.querySelector('#btn-close').addEventListener('click', function (e) {
			root.removeChild(error);
		})
		root.appendChild(error);
	}
	const isAssetRestricted = (assetInfoUrl, asset) => {
		return new Promise((resolve, reject) => {
			fetch(assetInfoUrl + '?publicId=' + asset.public_id + '&type=' + asset.type + '&rType=' + asset.resource_type).then(response => {
				if (response.ok) {
					response.json().then(data => {
						if (data.status === 'ok') {
							if (data.info.access_control) {
								resolve(data.info.access_mode !== 'public' || (data.info.access_control && data.info.access_control[0].access_type !== 'anonymous'));
							} else {
								return resolve(false);
							}
						} else {
							resolve(false);
						}
					})
				} else {
					resolve(false);
				}
			});
		})
	}
})();

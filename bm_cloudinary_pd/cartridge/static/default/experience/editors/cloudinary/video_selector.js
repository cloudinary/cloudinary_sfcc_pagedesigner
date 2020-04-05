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
				var root = document.getElementsByClassName('sfcc-ml-root')[0];
				var error = formsEls.htmlToElement(formsEls.getErrorToast('Wrong asset type.'));
				error.querySelector('#btn-close').addEventListener('click', function (e) {
					root.removeChild(error);
				})
				root.appendChild(error);
			} else {
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
			sandboxAttributes: ["allow-scripts", "allow-same-origin"]
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
})();

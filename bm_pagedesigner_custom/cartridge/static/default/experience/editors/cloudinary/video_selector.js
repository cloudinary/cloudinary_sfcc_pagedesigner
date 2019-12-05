(() => {
	const SECRET_TIMESTAMP = Date.now();

	// Page Designer ready event
	subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale, viewport }) => {
		console.log('cloudinary.video_selector::sfcc:ready', dataLocale, displayLocale, isDisabled, isRequired, value, config, viewport);

		const template = obtainTemplate(viewport);
		const clone = document.importNode(template.content, true);
		document.body.appendChild(clone);
		function insertHandler(data){
			emit({
		        type: 'sfcc:value',
		        payload: (data && data.assets && data.assets.length > 0)   ? data.assets[0] : null
		      });
		}

		var ml = cloudinary.createMediaLibrary({
			cloud_name: config.cloudName,
			api_key: config.apiKey,
			inline_container: 'div.sfcc-ml-root',
			max_files: 1,
			multiple: false,
			folder: {resource_type: "video"}
			}, {insertHandler: insertHandler}
		);
		ml.show();

	});

	function obtainTemplate(viewport) {
		const template = document.createElement('template');
		const height = viewport.height - 16; // 16px = padding top + padding bottom
		template.innerHTML = `<div class="sfcc-ml-root" style="height: ${height}px; max-height: ${height}px;"></div>`;
		return template;
	}
})();

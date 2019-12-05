(() => {
	let videoResources;
	let resourceType;
	subscribe('sfcc:ready', async ({value, config, isDisabled, isRequired, dataLocale, displayLocale}) => {
		console.log('cloudinary.video_selector_trigger::sfcc:ready', dataLocale, displayLocale, isDisabled, isRequired, value, config);
		resourceType = 'image';
		// videoResources = JSON.parse(config.fileData).resources;

		const selectedResourceId = obtainDisplayValue(value);
		// const selectedResource = selectedResourceId ? videoResources.find(option => selectedResourceId === option.public_id) : null;
		const template = obtainTemplate(value);
		const clone = document.importNode(template.content, true);
		document.body.appendChild(clone);

		// Apply event listeners
		const buttonEl = document.querySelector('button');
		const imgEl = document.querySelector(`.${resourceType}_selector__image img`);
		buttonEl && buttonEl.addEventListener('click', triggerBreakout);
		imgEl && imgEl.addEventListener('click', triggerBreakout);
	});

	function obtainTemplate(selectedResource) {
		const template = document.createElement('template');
		const markup = selectedResource ? obtainItemMarkup(selectedResource) : obtainDefaultMarkup();
		template.innerHTML = `<div class="${resourceType}_selector__container">${markup}</div>`;
		return template;
	}

	function imageTransform(option) {
		const { version, secure_url, format } = option;
		const arr = secure_url.split('v' + version); // Remove version number
		arr.splice(1, 0, 'c_lpad,h_150,w_150'); // Inject settings
		return arr.join('').replace('.' + format, '.jpg');
	}

	function obtainDefaultMarkup() {
		return `<div style="display: flex; justify-content: space-between; align-items: center;">
  <span>No ${resourceType} selected.</span>
  <button type="button" class="slds-button slds-button_neutral">Select</button>
</div>`;
	}

	function obtainItemMarkup(option) {
		const url = imageTransform(option);
		if (resourceType === 'image') {
  			return `<div class="${resourceType}_selector__image">
   			 <a href="javascript:void(0);"><img src="${url}" /></a>
  			</div>`
		} else {
			return `<div class="${resourceType}_selector__item" data-value="${option.public_id}">
  			<div class="${resourceType}_selector__image">
    <a href="javascript:void(0);"><img src="${url}" /></a>
  </div>
  <div class="video_selector__data">
    <span class="video_selector__data__id">${option.public_id}</span><br />
    <span class="video_selector__data__type">${option.resource_type}</span> - 
    <span class="video_selector__data__format">${option.format}</span> - 
    <span class="video_selector__data__size">${option.width} x ${option.height}</span>
  </div>
  <div class="video_selector__action">
    <button type="button" class="slds-button slds-button_neutral">Select</button>
  </div>
</div>`;
	}
	}

	function updateMarkup(value) {
		//const selectedResourceId = obtainDisplayValue(value);
		// const selectedResource = selectedResourceId ? videoResources.find(option => selectedResourceId === option.public_id) : null;

		// Remove event listeners
		let buttonEl = document.querySelector('button');
		let imgEl = document.querySelector(`.${resourceType}_selector__image img`);
		buttonEl && buttonEl.removeEventListener('click', triggerBreakout);
		imgEl && imgEl.removeEventListener('click', triggerBreakout);

		// Inject updated markup
		document.querySelector(`.${resourceType}_selector__container`).innerHTML = value ? obtainItemMarkup(value) : obtainDefaultMarkup();

		// Apply event listeners
		buttonEl = document.querySelector('button');
		imgEl = document.querySelector(`.${resourceType}_selector__image img`);
		buttonEl && buttonEl.addEventListener('click', triggerBreakout);
		imgEl && imgEl.addEventListener('click', triggerBreakout);
	}

	function obtainDisplayValue(value) {
		return typeof value === 'object' && value !== null && typeof value.public_id === 'string' ? value.public_id : null;
	}

	function triggerBreakout() {
		emit({
			type: 'sfcc:breakout',
			payload: {
				id: 'breakout',
				title: `Cloudinary Media Library (${resourceType})`
			}
		}, handleBreakoutClose);
	}

	function handleBreakoutClose({ type, value }) {
		if (type === 'sfcc:breakoutApply') {
			handleBreakoutApply(value);
		} else {
			handleBreakoutCancel();
		}
	}

	function handleBreakoutCancel() {
		// Grab focus
		const buttonEl = document.querySelector('button');
		buttonEl && buttonEl.focus();
	}

	function handleBreakoutApply(value) {
		// Update input value
		updateMarkup(value);

		// Emit value update
		emit({
			type: 'sfcc:value',
			payload: value
		});

		// Grab focus
		const buttonEl = document.querySelector('button');
		buttonEl && buttonEl.focus();
	}
})();

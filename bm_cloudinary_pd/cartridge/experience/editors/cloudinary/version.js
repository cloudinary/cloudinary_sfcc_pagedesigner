 'use strict';

var cloudinaryApi = require('~/cartridge/scripts/cloudinary/cloudinary_api');

module.exports.init = function (editor) {
	editor.configuration.put('iFrameEnv', cloudinaryApi.data.getIframeEnv());
}

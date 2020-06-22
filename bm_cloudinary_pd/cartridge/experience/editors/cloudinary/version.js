 'use strict';

var cloudinaryApi = require('~/cartridge/scripts/cloudinary/cloudinary_api');
var verJson = require('~/cartridge/scripts/cloudinary/version.json');

module.exports.init = function (editor) {
	editor.configuration.put('iFrameEnv', cloudinaryApi.data.getIframeEnv());
	editor.configuration.put('version', verJson.version);
}

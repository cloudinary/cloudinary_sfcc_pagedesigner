
'use strict';

var cloudinaryApi = require('~/cartridge/scripts/cloudinary/cloudinary_api');
var Logger = require('dw/system/Logger');

module.exports.init = function (editor) {
	editor.configuration.put('images', cloudinaryApi.getImageJSON());
};
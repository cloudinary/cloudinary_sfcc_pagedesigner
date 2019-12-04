'use strict';

var HashMap = require('dw/util/HashMap');
var PageMgr = require('dw/experience/PageMgr');
var Site = require('dw/system/Site');
var cloudinaryApi = require('~/cartridge/scripts/cloudinary/cloudinary_api');

module.exports.init = function (editor) {
	var conf = new HashMap();
	var imageSelector = PageMgr.getCustomEditor('cloudinary.image_selector', conf);
	editor.dependencies.put('breakout', imageSelector);
};

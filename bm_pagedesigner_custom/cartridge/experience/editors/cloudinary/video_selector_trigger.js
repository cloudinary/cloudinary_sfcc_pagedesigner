'use strict';

var HashMap = require('dw/util/HashMap');
var PageMgr = require('dw/experience/PageMgr');
var Site = require('dw/system/Site');
var cloudinaryApi = require('~/cartridge/scripts/cloudinary/cloudinary_api');

module.exports.init = function (editor) {
	var conf = new HashMap();
	var globalSettings = cloudinaryApi.getImageSettingUrlPart();
	conf.put('imageGlob', globalSettings);
	var videoSelector = PageMgr.getCustomEditor('cloudinary.video_selector', conf);
	editor.dependencies.put('breakout', videoSelector);
};

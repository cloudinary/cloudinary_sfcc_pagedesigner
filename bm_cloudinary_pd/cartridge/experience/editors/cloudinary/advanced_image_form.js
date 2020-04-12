
 'use strict';

var PageMgr = require('dw/experience/PageMgr');
var HashMap = require('dw/util/HashMap');
var cloudinaryApi = require('~/cartridge/scripts/cloudinary/cloudinary_api');

module.exports.init = function (editor) {
	var conf = new HashMap();
	conf.put('type', 'image');
	conf.put('imageType', 'overlay');
	var videoSelector = PageMgr.getCustomEditor('cloudinary.video_selector', conf);
	editor.dependencies.put('overlayBreakout', videoSelector);
	editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
	editor.configuration.put('globalTrans', cloudinaryApi.globalTransform());
	editor.configuration.put('apiKey', cloudinaryApi.data.getAPIKey());
}
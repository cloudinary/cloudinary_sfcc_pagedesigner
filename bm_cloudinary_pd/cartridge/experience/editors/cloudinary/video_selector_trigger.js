'use strict';

var HashMap = require('dw/util/HashMap');
var PageMgr = require('dw/experience/PageMgr');
var Site = require('dw/system/Site');

module.exports.init = function (editor) {
	var conf = new HashMap();
	conf.put('type', editor.configuration.mlType);
	var videoSelector = PageMgr.getCustomEditor('cloudinary.video_selector', conf);
	editor.dependencies.put('breakout', videoSelector);
};

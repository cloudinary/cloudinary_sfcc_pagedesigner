 'use strict';

var PageMgr = require('dw/experience/PageMgr');
var HashMap = require('dw/util/HashMap');

module.exports.init = function (editor) {
	var conf = new HashMap();
	conf.put('type', editor.configuration.mlType);
	var videoSelector = PageMgr.getCustomEditor('cloudinary.video_selector', conf);
	editor.dependencies.put('breakout', videoSelector);
}

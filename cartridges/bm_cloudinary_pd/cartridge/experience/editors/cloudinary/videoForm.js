'use strict';

var PageMgr = require('dw/experience/PageMgr');
var HashMap = require('dw/util/HashMap');
var cloudinaryApi = require('*/cartridge/scripts/cloudinary/cloudinaryApi');

module.exports.init = function (editor) {
    var conf = new HashMap();
    conf.put('type', 'video');
    editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
    editor.configuration.put('cname', cloudinaryApi.data.getCloudinaryCNAME());
    var videoSelector = PageMgr.getCustomEditor('cloudinary.mediaSelector', conf);
    var adv = PageMgr.getCustomEditor('cloudinary.advancedVideoForm', conf);
    editor.dependencies.put('advBreakout', adv);
    editor.dependencies.put('breakout', videoSelector);
    editor.configuration.put('iFrameEnv', cloudinaryApi.data.getIframeEnv());
};

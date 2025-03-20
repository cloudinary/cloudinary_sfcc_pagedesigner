'use strict';

var PageMgr = require('dw/experience/PageMgr');
var HashMap = require('dw/util/HashMap');
var cloudinaryApi = require('*/cartridge/scripts/cloudinary/cloudinaryApi');
var URLUtils = require('dw/web/URLUtils');
var URLAction = require('dw/web/URLAction');
var CSRF = require('dw/web/CSRFProtection');

module.exports.init = function (editor) {
    var conf = new HashMap();
    var csrf = new HashMap();
    csrf.put(CSRF.getTokenName(), CSRF.generateToken());
    var linkUrlAct = URLUtils.abs('Links-url').toString();
    editor.configuration.put('linkBuilderUrl', linkUrlAct);
    editor.configuration.put('csrf', csrf);
    conf.put('type', 'image');
    editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
    editor.configuration.put('cname', cloudinaryApi.data.getCloudinaryCNAME());
    editor.configuration.put('globalTrans', cloudinaryApi.globalTransform());
    editor.configuration.put('iFrameEnv', cloudinaryApi.data.getIframeEnv());
    var videoSelector = PageMgr.getCustomEditor('cloudinary.mediaSelector', conf);
    var adv = PageMgr.getCustomEditor('cloudinary.advancedImageForm', conf);
    editor.dependencies.put('advBreakout', adv);
    editor.dependencies.put('breakout', videoSelector);
};

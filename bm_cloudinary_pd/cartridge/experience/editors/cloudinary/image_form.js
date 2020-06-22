
 'use strict';

var PageMgr = require('dw/experience/PageMgr');
var HashMap = require('dw/util/HashMap');
var cloudinaryApi = require('~/cartridge/scripts/cloudinary/cloudinary_api');
var URLUtils = require('dw/web/URLUtils');
var URLAction = require('dw/web/URLAction');
var Site = require('dw/system/Site');
var CSRF = require('dw/web/CSRFProtection');

module.exports.init = function (editor) {
	var conf = new HashMap();
	var csrf = new HashMap();
	csrf.put(CSRF.getTokenName(), CSRF.generateToken());
	var currentSite = Site.getCurrent();
	var act = new URLAction('Brpoints-Points', currentSite.getID());
	var linkUrlAct = new URLAction('Links-url', currentSite.getID());
	editor.configuration.put('breakpointsUrl', URLUtils.abs(act).toString());
	editor.configuration.put('linkBuilderUrl', URLUtils.abs(linkUrlAct).toString());
	editor.configuration.put('csfr', csrf)
	conf.put('type', 'image');
	editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
	editor.configuration.put('cname', cloudinaryApi.data.getCloudinaryCNAME());
	editor.configuration.put('globalTrans', cloudinaryApi.globalTransform());
	editor.configuration.put('iFrameEnv', cloudinaryApi.data.getIframeEnv());
	var videoSelector = PageMgr.getCustomEditor('cloudinary.video_selector', conf);
	var adv = PageMgr.getCustomEditor('cloudinary.advanced_image_form', conf);
	editor.dependencies.put('advBreakout', adv);
	editor.dependencies.put('breakout', videoSelector);
}
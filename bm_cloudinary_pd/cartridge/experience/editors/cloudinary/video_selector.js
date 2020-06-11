'use strict';

var cloudinaryApi = require('~/cartridge/scripts/cloudinary/cloudinary_api');
var Logger = require('dw/system/Logger');
var URLUtils = require('dw/web/URLUtils');
var URLAction = require('dw/web/URLAction');
var Site = require('dw/system/Site');
var verJson = require('~/cartridge/scripts/cloudinary/version.json');

module.exports.init = function (editor) {
	editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
	editor.configuration.put('cname', cloudinaryApi.data.getCloudinaryCNAME());
	editor.configuration.put('apiKey', cloudinaryApi.data.getAPIKey());
	var envStr = cloudinaryApi.data.getIframeEnv();
	var env = 'dev';
	if (envStr === 'https://page-designer.cloudinary.com') {
		env = 'prod'
	} else if (envStr === 'https://page-designer-staging.cloudinary.com') {
		env = 'staging'
	}
	editor.configuration.put('env', env);
	editor.configuration.put('version', verJson.version);
	var currentSite = Site.getCurrent();
	var act = new URLAction('Asset-info', currentSite.getID());
	editor.configuration.put('assetInfoUrl', URLUtils.abs(act).toString());
};

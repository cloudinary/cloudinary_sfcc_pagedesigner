'use strict';

var cloudinaryApi = require('~/cartridge/scripts/cloudinary/cloudinary_api');
var Logger = require('dw/system/Logger');
var URLUtils = require('dw/web/URLUtils');
var URLAction = require('dw/web/URLAction');
var Site = require('dw/system/Site');

module.exports.init = function (editor) {
	editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
	editor.configuration.put('cname', cloudinaryApi.data.getCloudinaryCNAME());
	editor.configuration.put('apiKey', cloudinaryApi.data.getAPIKey());
	var currentSite = Site.getCurrent();
	var act = new URLAction('Asset-info', currentSite.getID());
	editor.configuration.put('assetInfoUrl', URLUtils.abs(act).toString());
};

'use strict';

var cloudinaryApi = require('*/cartridge/scripts/cloudinary/cloudinaryApi');
var URLUtils = require('dw/web/URLUtils');
var URLAction = require('dw/web/URLAction');
var verJson = require('*/cartridge/scripts/cloudinary/version.json');

module.exports.init = function (editor) {
    editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
    editor.configuration.put('cname', cloudinaryApi.data.getCloudinaryCNAME());
    editor.configuration.put('apiKey', cloudinaryApi.data.getAPIKey());
    var envStr = cloudinaryApi.data.getIframeEnv();
    var env = 'dev';
    if (envStr === 'https://page-designer.cloudinary.com') {
        env = 'prod';
    } else if (envStr === 'https://page-designer-staging.cloudinary.com') {
        env = 'staging';
    }
    editor.configuration.put('env', env);
    editor.configuration.put('version', verJson.version);
    var act = URLUtils.abs('Asset-info').toString();
    editor.configuration.put('assetInfoUrl', act);
};

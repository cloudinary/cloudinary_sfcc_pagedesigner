'use strict';

var cloudinaryApi = require('*/cartridge/scripts/cloudinary/cloudinaryApi');

module.exports.init = function (editor) {
    editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
    editor.configuration.put('apiKey',    cloudinaryApi.data.getAPIKey());
};

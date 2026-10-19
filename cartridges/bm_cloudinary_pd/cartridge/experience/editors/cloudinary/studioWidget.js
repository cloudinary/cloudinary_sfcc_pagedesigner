'use strict';


module.exports.init = function (editor) {
    var cloudinaryApi = require('*/cartridge/scripts/cloudinary/cloudinaryApi');
    editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
    editor.configuration.put('apiKey',    cloudinaryApi.data.getAPIKey());
};

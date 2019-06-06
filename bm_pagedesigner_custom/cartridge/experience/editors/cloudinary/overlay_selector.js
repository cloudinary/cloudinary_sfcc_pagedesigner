 'use strict';

var Resource = require('dw/web/Resource');
var HashMap = require('dw/util/HashMap');
var Site = require('dw/system/Site');
var cloudinary_api = require('~/cartridge/scripts/cloudinary/cloudinary_api');

module.exports.init = function (editor) {
    var jsonString = JSON.stringify(cloudinary_api.getImageJSON());

    editor.configuration.put('fileData', jsonString);
}


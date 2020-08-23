'use strict';

var Logger = require('dw/system/Logger');
var HashMap = require('dw/util/HashMap');

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var currentSite = require('dw/system/Site').getCurrent();

var data = {
    getAPIKey: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerAPIkey');
    },

    getSecretKey: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerSecretKey');
    },

    getCloudinaryCNAME: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCNAME');
    },

    getCloudName: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCloudName');
    },
    getIframeEnv: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerEnv');
    }
};

// define service
var cloudinaryService = LocalServiceRegistry.createService('cloudinary.https.api', {
    createRequest: function (service, param) {
        service.setAuthentication('NONE');
        return param || null;
    },
    parseResponse: function (service, client) {
        return client;
    }
});

var serviceURL = cloudinaryService.URL;

/**
 * Addes cloudinery prefix to log entries
 * @param {Error} e error to log
 */
function logger(e) {
    Logger.error('Cloudinary. File - calls.js. Error - {0}', e);
}

/**
 * Call Cloudinary service
 * @param {Object} body post body
 * @param {string} fileType cloudinary file type
 * @param {string} callType action to take
 *
 * @returns {Object} Object with fields: 'ok' {boolean} upload result, 'message' {string} error message
 */
function callService(body, fileType, callType) {
    var serviceResponse;
    var cloudinaryResponse = {
        ok: false,
        message: ''
    };

    try {
        cloudinaryService.setRequestMethod('POST');
        cloudinaryService.setURL(serviceURL + '/' + data.getCloudName() + '/' + fileType + '/' + callType);
        cloudinaryService.addHeader('Content-Type', 'application/json');

        serviceResponse = cloudinaryService.call(JSON.stringify(body));

        if (serviceResponse.ok) {
            if (serviceResponse.object.statusCode === '200') {
                cloudinaryResponse.ok = true;
                cloudinaryResponse.message = serviceResponse.object.text;
            } else {
                cloudinaryResponse.message = serviceResponse.object.errorText;
            }
        } else {
            cloudinaryResponse.message = serviceResponse.errorMessage;
        }
    } catch (e) {
        logger(e);
        cloudinaryResponse.message = e.message;
    }
    return cloudinaryResponse;
}

/**
 *  gets the video global transformation settings
 *  @returns {HashMap} hashmap of global transformation values.
 */
function getImageGlobalTransforms() {
    var trans = new HashMap();
    trans.put('dpr', currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsDPR').getValue());
    trans.put('fetchFormat', currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsFormat').getValue());
    trans.put('quality', currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsQuality').getValue());
    trans.put('raw_transformation', currentSite.getCustomPreferenceValue('CloudinaryImageTransformations'));
    return trans;
}

module.exports.data = data;
module.exports.globalTransform = getImageGlobalTransforms;
module.exports.callService = callService;

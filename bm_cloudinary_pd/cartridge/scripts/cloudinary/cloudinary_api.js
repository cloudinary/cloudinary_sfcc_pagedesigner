'use strict';

var Logger = require('dw/system/Logger');

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

    getTagName: function () {
        // Should be '/tags/SFCCPageDesigner'
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerTag');
    }
};

var cloudinaryService = LocalServiceRegistry.createService('cloudinaryPageDesignerAPI', {
    createRequest: function (service, param) {
        service.setAuthentication('NONE');
        return param || null;
    },
    parseResponse: function (service, client) {
        return client;
    },
    filterLogMessage: function (message) {
        return message;
    },
    getRequestLogMessage: function (serviceRequest) {
        return serviceRequest;
    },
    getResponseLogMessage: function (serviceResponse) {
        var logMessage;
        if (typeof serviceResponse === 'object') {
            var logMessageArr = [];
            logMessageArr.push('statusCode: ' + serviceResponse.statusCode);
            if (serviceResponse.text) {
                logMessageArr.push('length of response text: ' + serviceResponse.text.length);
            }
            if (serviceResponse.errorText) {
                logMessageArr.push('errorText: ' + serviceResponse.errorText);
            }
            logMessage = logMessageArr.join(', ');
        } else {
            logMessage = 'unknown error';
        }
        return logMessage;
    }
});

/**
 * Logger
 * @param {string} e Error String
 */
function logger(e) {
    Logger.error('Cloudinary. File - calls.js. Error - {0}', e);
}

/**
 * Searches file on Cloudinary
 * @param {string} resourceType Resource Type
 * @returns {Object} Object containing response
 */
function getResourceList(resourceType) {
    var service = cloudinaryService;
    var serviceResponse;
    var cloudinaryResponse;

    try {
        service.setRequestMethod('GET');
        var src = 'https://res.cloudinary.com/' + data.getCloudName() + '/' + resourceType + '/list/' + data.getTagName() + '.json';
        service.setURL(src);
        service.addHeader('Content-Type', 'application/json');
        serviceResponse = service.call();

        if (serviceResponse.ok) {
            if (serviceResponse.object.statusCode === '200' || serviceResponse.object.statusCode === 200) {
                cloudinaryResponse = serviceResponse.object.text;
                cloudinaryResponse.src = src;
            } else {
                cloudinaryResponse = {
                    error: true,
                    message: serviceResponse.object.errorText
                };
            }
        } else {
            cloudinaryResponse = {
                error: true,
                message: serviceResponse.errorMessage
            };
        }
        return cloudinaryResponse;
    } catch (e) {
        logger(e);

        return {
            error: true
        };
    }
}

/**
 * Get Video JSON
 * @returns {Object} Object with video data
 */
function getVideoJSON() {
    var videoJSON = getResourceList('video');

    return JSON.parse(videoJSON);
}

/**
 * Get Image JSON
 * @returns {Object} Object with image data
 */
function getImageJSON() {
    var imageJSON = getResourceList('image');

    return JSON.parse(imageJSON);
}

module.exports.getVideoJSON = getVideoJSON;
module.exports.getImageJSON = getImageJSON;

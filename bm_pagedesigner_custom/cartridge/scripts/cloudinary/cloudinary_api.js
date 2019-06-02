'use strict';

//var server = require('server');
var Logger = require('dw/system/Logger');

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var currentSite = require('dw/system/Site').getCurrent();

var data = {
    isCloudinaryEnabled: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryEnabled');
    },

    getAPIKey: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryAPIkey');
    },

    getSecretKey: function () {
        return currentSite.getCustomPreferenceValue('CloudinarySecretKey');
    },

    getCloudinaryCNAME: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryCNAME');
    },

    getCloudName: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryCloudName');
    }
};

// define service
var cloudinaryService = LocalServiceRegistry.createService("cloudinaryAPI", {
	createRequest: function (service, param) {
		service.setAuthentication('NONE');
		return param || null;
	},
	parseResponse: function (service, client) {
		return client;
	}
});

var serviceURL = cloudinaryService.URL;

// define logger
function logger(e) {
	Logger.error('Cloudinary. File - calls.js. Error - {0}', e);
}

/**
 * Call Cloudinary service
 * @param {Object} body
 * @param {string} fileType
 * @param {string} callType
 *
 * @returns {Object} Object with fields: 'ok' {boolean} upload result, 'message' {string} error message
 */
function callService(body, fileType, callType) {
    var serviceResponse,
        cloudinaryResponse = {
            ok: false,
            message: ''
        };

	try {
		cloudinaryService.setRequestMethod('POST');
		cloudinaryService.setURL(serviceURL + '/' + data.getCloudName() + '/' + fileType + '/' + callType);
        cloudinaryService.addHeader('Content-Type', 'application/json');

		serviceResponse = cloudinaryService.call(JSON.stringify(body));

		if (serviceResponse.ok) {
            if (serviceResponse.object.statusCode == '200') {
                cloudinaryResponse.ok = true;
                cloudinaryResponse.message = serviceResponse.object.text;
			} else {
				cloudinaryResponse.message = serviceResponse.object.errorText
			}
		} else {
            cloudinaryResponse.message = serviceResponse.errorMessage
		}

	} catch (e) {
		logger(e);
		cloudinaryResponse.message = e.message
    }
    return cloudinaryResponse;
};

/**
 * Searches file on Cloudinary
 * @param {string} next_cursor
 */
function getResourceList(resourceType) {
	// https://api.cloudinary.com/v1_1/df76yiogz/resources/video/tags/SFCCPageDesigner
    // https://cloudinary-naveen-res.cloudinary.com/video/list/v1556746170/SFCCPageDesigner.json
	var service = cloudinaryService, serviceResponse, cloudinaryResponse;

	try {
		service.setRequestMethod('GET');
		service.setURL('https://' + data.getAPIKey() + ':' + data.getSecretKey() + '@api.cloudinary.com/v1_1/' + data.getCloudName() + '/resources/' + resourceType + '/tags/SFCCPageDesigner');
		service.addHeader('Content-Type', 'application/json');
		serviceResponse = service.call();

		if (!serviceResponse.ok) {
			cloudinaryResponse = {
				error: true,
				message: serviceResponse.errorMessage
			}
		} else {
			if (serviceResponse.object.statusCode != '200') {
				cloudinaryResponse = {
					error: true,
					message: serviceResponse.object.errorText
				}
			} else {
				cloudinaryResponse = serviceResponse.object.text;
			}
		}
		return cloudinaryResponse;

	} catch (e) {
		logger(e);

		return {
			error: true
		};
	}
}

function getVideoJSON() {
    var videoJSON = getResourceList('video');

    return JSON.parse(videoJSON);
}

function getImageJSON() {
    var imageJSON = getResourceList('image');

    return JSON.parse(imageJSON);
}

module.exports.getVideoJSON = getVideoJSON;
module.exports.getImageJSON = getImageJSON;

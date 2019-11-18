'use strict';
//test123
//var server = require('server');
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
		// Should be "/tags/SFCCPageDesigner"
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerTag');
    }
};

// define service
var cloudinaryService = LocalServiceRegistry.createService("cloudinaryPageDesignerAPI", {
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
	var service = cloudinaryService, serviceResponse, cloudinaryResponse;

	try {
		service.setRequestMethod('GET');
		var src = 'https://' + data.getAPIKey() + ':' + data.getSecretKey() + '@api.cloudinary.com/v1_1/' + data.getCloudName() + '/resources/' + resourceType + '/tags/' + data.getTagName();
		service.setURL(src);
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
				cloudinaryResponse.src = src;
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
module.exports.data = data;

'use strict';

var server = require('server');
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


server.get('Test', server.middleware.https, function (req, res, next) {
    // https://fluid01-alliance-prtnr-na03-dw.demandware.net/on/demandware.store/Sites-SiteGenesis-Site/default/Cloudinary-Test

    var videoJSON = getResourceList('video');
    var imageJSON = getResourceList('image');

    res.render('json', {
        videoJSON: JSON.parse(videoJSON),
        imageJSON: JSON.parse(imageJSON)
    });

    next();
});

server.get('Fetch', server.middleware.https, function (req, res, next) {

	// https://fluid01-alliance-prtnr-na03-dw.demandware.net/on/demandware.store/Sites-SiteGenesis-Site/default/Cloudinary-Fetch

	var username = '133612835811619';
    var password = 'iqOgJDGOfV0FTpIRXa9Zqqt6ey';
	var uri = 'https://' + username + ':' + password + '@api.cloudinary.com/v1_1/df76yiogz/resources/video';

	var httpClient : HTTPClient = new dw.net.HTTPClient();
	var httpResults = '';
	var json;
	var dropdown = [];
	var error = '';

    /*
	try {
		httpClient.open('GET', uri, username, password);
		httpClient.send();

        if (httpClient.statusCode == 200) {
            httpResults = httpClient.text;
            var json = JSON.stringify(httpResults);
            if (json.error != undefined) {
            	error = 'Cloudinary: Request error. Error Text = ' + json.error.message;
            } else if (json.resources != undefined) {
                if (json.resources.length) {
                    Logger.error('Cloudinary: Resources', json.resources);
                    for (var i=0; i < json.resources.length; i++) {
                        dropdown.push(json.resources[i].public_id);
                    }
                } else {
                    error = 'Cloudinary: Resources returned zero results';
                }
            }
        } else {
            error = 'Cloudinary: Error connecting. Status Code = ' + httpClient.statusCode;
        }

	} catch(e) {
        error = 'Cloudinary: Catch Error.';
	}
    */

	/*
    res.json({
        success: true,
        msg: 'test',
        dropdown: dropdown,
        error: error,
        statusCode: httpClient.statusCode,
        text: httpClient.text,
        httpResults: httpResults,
        json: json
    });

    var cloudinaryService = LocalServiceRegistry.createService("cloudinary", {
         createRequest: function(svc:HTTPService, params) {
             var authCode = svc.getConfiguration().getCredential().getPassword();

             svc.addHeader('key', svc.getConfiguration().getCredential().getUser());
             var url = svc.getConfiguration().getCredential().getURL();
             svc.addHeader('Authorization', params.auth);
             svc.addHeader('Content-Type', 'application/json');

             svc.setRequestMethod('GET');
             svc.setURL(buildURL(svc, args));
             return null;
         },
         parseResponse : function(svc:HTTPService, client:HTTPClient) {
    		return client.text;
         }
     });

    var result : Result = cloudinaryService.call();
    if(result.status == 'OK') {
        // The result.object is the object returned by the 'after' callback.
    } else {
        // Handle the error. See result.error for more information.
    }

    var service:Service;
    var result:Result;
    var counter = args.numCalls;
    var mockCall = false;
    var pipelineError = false;
    var returnCode = args.returnCode;
    var requestBody = {'testString':'foo', 'testNum': 5, 'testBool': true};

    service = ServiceRegistry.get("test.http.get");
    service.URL += "/get";
    service.addHeader('testHeader', 'testHeaderValue').addParam('filter', true);
    result = service.call(service, requestBody);
    */

    next();
});

module.exports = server.exports();

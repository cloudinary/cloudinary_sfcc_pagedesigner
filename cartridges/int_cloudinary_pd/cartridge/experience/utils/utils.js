'use strict';

var currentSite = require('dw/system/Site')
    .getCurrent();
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var MessageDigest = require('dw/crypto/MessageDigest');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');
var constants = require('~/cartridge/experience/utils/cloudinaryPDConstants').cloudinaryPDConstants;

/**
 * strigify a json for API call
 * @param {Array} breakpoints array of transformations
 * @returns {string|null} stringifyed json
 */
function generateResponsiveBreakpointsString(breakpoints) {
    if (breakpoints == null) {
        return null;
    }
    if (!Array.isArray(breakpoints)) {
        // eslint-disable-next-line no-param-reassign
        breakpoints = [breakpoints];
    }
    return JSON.stringify(breakpoints);
}

/**
 * Make an API call to cloudinary
 * @param {Object} body request body
 * @param {string} fileType the file type video|image
 * @param {string} callType the action to take
 * @returns {{ok: boolean, message: string}} call result
 */
function callService(body, fileType, callType) {
    var cloudinaryService = LocalServiceRegistry.createService('cloudinaryPageDesignerAPI', {
        createRequest: function (service, param) {
            const credential = service.getConfiguration().getCredential();
            var url = credential.getURL();
            service.setRequestMethod('POST');
            service.setAuthentication('NONE');
            service.addHeader('Content-Type', 'application/json');
            service.addHeader('User-Agent', constants.API_TRACKING_PARAM);
            
            // add cloud name if placeholder [cloudname] is present
            if (url.indexOf(constants.CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER) > -1) {
                url = url.replace(constants.CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER, constants.CLD_CLOUDNAME);
            }
            service.setURL(url);
            // eslint-disable-next-line no-param-reassign
            service.URL += '/' + fileType + '/' + callType;
            return param || null;
        },
        parseResponse: function (service, response) {
            if (response.statusCode === 200 && response.statusMessage === 'OK') {
                return JSON.parse(response.text);
            }
            return response;
        },
        filterLogMessage: function (msg) {
            return msg;
        }
    });
    var serviceResponse;
    var cloudinaryResponse = {
        ok: false,
        message: ''
    };
    try {
        serviceResponse = cloudinaryService.call(JSON.stringify(body));
        if (serviceResponse.ok) {
            cloudinaryResponse.ok = true;
            cloudinaryResponse.message = serviceResponse.object;
        } else {
            cloudinaryResponse.message = serviceResponse.errorMessage;
        }
    } catch (e) {
        // eslint-disable-next-line no-undef
        Logger.error(e);
        cloudinaryResponse.message = e.message;
    }
    return cloudinaryResponse;
}

module.exports = {
    callService: callService,
    stringifyJson: generateResponsiveBreakpointsString
};

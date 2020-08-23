'use strict';

var currentSite = require('dw/system/Site')
    .getCurrent();
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var MessageDigest = require('dw/crypto/MessageDigest');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');

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
 * returns signature for request body
 * @param {Object} body the request body object
 * @returns {string} signature
 */
function bodySignature(body) {
    var hasher = new MessageDigest(MessageDigest.DIGEST_SHA_256);
    var fieldsArray = [];
    for (var i in body) {
        if (body[i] === '' || body[i] == null) {
            // eslint-disable-next-line no-param-reassign
            delete body[i];
        } else if (i === 'responsive_breakpoints') {
            fieldsArray.push(i + '=' + generateResponsiveBreakpointsString(body[i]));
        } else if (Array.isArray(body[i])) {
            fieldsArray.push(i + '=' + body[i].map(function (el) {
                return JSON.stringify(el);
            })
                .join(','));
        } else {
            fieldsArray.push(i + '=' + body[i]);
        }
    }
    var fields = fieldsArray.sort()
        .join('&');
    var toSignStr = fields + currentSite.getCustomPreferenceValue('CloudinaryPageDesignerSecretKey');
    var toSign = new Bytes(toSignStr);
    return Encoding.toHex(hasher.digestBytes(toSign));
}

/**
 * Make an API call to cloudinary
 * @param {Object} body request body
 * @param {string} fileType the file type video|image
 * @param {string} callType the action to take
 * @returns {{ok: boolean, message: string}} call result
 */
function callService(body, fileType, callType) {
    var cloudinaryService = LocalServiceRegistry.createService('cloudinary.https.api', {
        createRequest: function (service, param) {
            service.setRequestMethod('POST');
            service.setAuthentication('NONE');
            service.addHeader('Content-Type', 'application/json');
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
    addSignatureToBody: bodySignature,
    callService: callService,
    stringifyJson: generateResponsiveBreakpointsString
};

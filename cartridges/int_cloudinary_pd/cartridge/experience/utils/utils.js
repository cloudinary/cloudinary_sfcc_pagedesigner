'use strict';

var currentSite = require('dw/system/Site').getCurrent();
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var cloudName = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCloudName');
var MessageDigest = require('dw/crypto/MessageDigest');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');

var cloudinaryService = LocalServiceRegistry.createService('cloudinaryPageDesignerAPI', {
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
    var hasher = null;
    var useSha256 = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerUseSha256') === true;
    if (useSha256) {
        hasher = new MessageDigest(MessageDigest.DIGEST_SHA_256);
    } else {
        hasher = new MessageDigest(MessageDigest.DIGEST_SHA_1);
    }
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
            }).join(','));
        } else {
            fieldsArray.push(i + '=' + body[i]);
        }
    }
    var fields = fieldsArray.sort().join('&');
    var toSignStr = fields + currentSite.getCustomPreferenceValue('CloudinaryPageDesignerSecretKey');
    var toSign = new Bytes(toSignStr);
    return Encoding.toHex(hasher.digestBytes(toSign));
}

/**
 * Make an API call to cloudinary
 * @param {Object} body request body
 * @param {string} fileType the file type video|image
 * @param {string} callType the action to take
 * @returns {{ok: boolean, message: string}}
 */
function callService(body, fileType, callType) {
    var serviceResponse;
    var cloudinaryResponse = {
        ok: false,
        message: ''
    };

    try {
        cloudinaryService.setRequestMethod('POST');
        cloudinaryService.setURL(serviceURL + '/' + cloudName + '/' + fileType + '/' + callType);
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
        // eslint-disable-next-line no-undef
        Logger.error(e);
        cloudinaryResponse.message = e.message;
    }
    return cloudinaryResponse;
}

/**
 * creates a basic authentication string
 * @returns {string} basic authentication
 */
function createBasicAuthStr() {
    var bytes = new Bytes(currentSite.getCustomPreferenceValue('CloudinaryPageDesignerAPIkey') + ':' + currentSite.getCustomPreferenceValue('CloudinaryPageDesignerSecretKey'));
    return Encoding.toBase64(bytes);
}

module.exports = {
    addSignatureToBody: bodySignature,
    callService: callService,
    stringifyJson: generateResponsiveBreakpointsString,
    createBasicAuthStr: createBasicAuthStr
};

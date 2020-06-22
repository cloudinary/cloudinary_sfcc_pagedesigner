
var currentSite = require('dw/system/Site').getCurrent();
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var cloudName = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCloudName');
var MessageDigest = require('dw/crypto/MessageDigest');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');


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

function addSignatureToBody(body) {
    var hasher = null;
    var useSha256 = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerUseSha256') === true;
    if (useSha256) {
        hasher = new MessageDigest(MessageDigest.DIGEST_SHA_256);
    } else {
        hasher = new MessageDigest(MessageDigest.DIGEST_SHA_1);
    }
    var fieldsArray = [];
    for (var i in body) {
        if (body[i] == '' || body[i] == null) {
            delete body[i];
        }
        else if (i === "responsive_breakpoints") {
            fieldsArray.push(i + '=' + generate_responsive_breakpoints_string(body[i]));
        }
        else if (Array.isArray(body[i])) {
            fieldsArray.push(i + '=' + body[i].map(function (el) {
                return JSON.stringify(el);
            }).join(','));
        }
        else {
            fieldsArray.push(i + '=' + body[i]);
        }
    }
    var fields = fieldsArray.sort().join('&');
    var toSignStr = fields + currentSite.getCustomPreferenceValue('CloudinaryPageDesignerSecretKey');
    var toSign = new Bytes(toSignStr);
    var signature = Encoding.toHex(hasher.digestBytes(toSign));
    return signature;
};

function verifySignature(body, ts, signature) {
    let hasher = new MessageDigest(MessageDigest.DIGEST_SHA_1)
    let toSig = new Bytes(body + ts + currentSite.getCustomPreferenceValue('CloudinaryPageDesignerSecretKey'));
    let sig = Encoding.toHex(hasher.digestBytes(toSig));
    return signature === sig;
}

function callService(body, fileType, callType) {
    var serviceResponse,
        cloudinaryResponse = {
            ok: false,
            message: ''
        };

    try {
        cloudinaryService.setRequestMethod('POST');
        cloudinaryService.setURL(serviceURL + '/' + cloudName + '/' + fileType + '/' + callType);
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
        Logger.error(e);
        cloudinaryResponse.message = e.message
    }
    return cloudinaryResponse;
};

function generate_responsive_breakpoints_string(breakpoints) {
    if (breakpoints == null) {
        return null;
    }
    breakpoints = breakpoints;
    if (!Array.isArray(breakpoints)) {
        breakpoints = [breakpoints];
    }
    var b = JSON.stringify(breakpoints);
    return b;
}

function createBasicAuthStr() {
    var bytes = new Bytes(currentSite.getCustomPreferenceValue('CloudinaryPageDesignerAPIkey') + ":" + currentSite.getCustomPreferenceValue('CloudinaryPageDesignerSecretKey'));
    return Encoding.toBase64(bytes);
}

module.exports = {
    addSignatureToBody: addSignatureToBody,
    callService: callService,
    stringifyJson: generate_responsive_breakpoints_string,
    verifySignature: verifySignature,
    createBasicAuthStr: createBasicAuthStr
}
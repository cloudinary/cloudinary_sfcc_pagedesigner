'use strict';

var guard = require('~/cartridge/scripts/guard');
var Response = require('~/cartridge/scripts/util/Response');

var params = request.httpParameterMap;

/**
 * Gets the asset info from cloudinary
 * @param {string} publicId asset publicId
 * @param {string} type type of asset
 * @param {string} rType asset file type image|video
 * @returns {null|Object} asset object
*/
function getAssetInfo(publicId, type, rType) {
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
    var constants = require('~/cartridge/experience/utils/cloudinaryPDConstants').cloudinaryPDConstants;
    var cloudinaryService = LocalServiceRegistry.createService('cloudinaryPageDesignerAPI', {
        createRequest: function (service, param) {
            service.setRequestMethod('GET');
            service.addHeader('Content-Type', 'application/json');
            service.addHeader('User-Agent', constants.API_TRACKING_PARAM);
            var urlPart = encodeURIComponent('/resources/' + rType + '/' + type + '/' + publicId);

            const credential = service.getConfiguration().getCredential();
            var url = credential.getURL();
            // add cloud name if placeholder [cloudname] is present
            if (url.indexOf(constants.CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER) > -1) {
                url = url.replace(constants.CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER, constants.CLD_CLOUDNAME);
            }
            service.setURL(url);

            // eslint-disable-next-line no-param-reassign
            service.URL += urlPart;
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
    var res = cloudinaryService.call();
    if (res.ok) {
        return res.object;
    }
    return null;
}

function info () {
    var publicId = params.publicId.value;
    var type = params.type.value;
    var rType = params.rType.value;
    // Response.setHttpHeader('Access-Control-Allow-Origin', '*');
    if (publicId) {
        var info = getAssetInfo(publicId, type, rType);
        Response.renderJSON({
            status: 'ok',
            data: info
        });
    } else {
        Response.renderJSON({
            status: 'error',
            message: 'missing publicId'
        });
    }
};

exports.info = guard.ensure(['https', 'get'], info);


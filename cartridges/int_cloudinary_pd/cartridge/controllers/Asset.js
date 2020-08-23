'use strict';

var server = require('server');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
// var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * Gets the asset info from cloudinary
 * @param {string} publicId asset publicId
 * @param {string} type type of asset
 * @param {string} rType asset file type image|video
 * @returns {null|Object} asset object
 */
function getAssetInfo(publicId, type, rType) {
    var cloudinaryService = LocalServiceRegistry.createService('cloudinary.https.api', {
        createRequest: function (service, param) {
            service.setRequestMethod('GET');
            service.addHeader('Content-Type', 'application/json');
            var urlPart = encodeURIComponent('/resources/' + rType + '/' + type + '/' + publicId);
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

server.get('info', server.middleware.https, function (req, res, next) {
    var publicId = req.querystring.publicId;
    var type = req.querystring.type;
    var rType = req.querystring.rType;
    if (publicId) {
        var info = getAssetInfo(publicId, type, rType);
        res.json({
            status: 'ok',
            info: info
        });
    } else {
        res.json({
            status: 'error',
            message: 'missing publicId'
        });
    }
    next();
});

module.exports = server.exports();

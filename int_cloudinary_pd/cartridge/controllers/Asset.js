'use strict';

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var currentSite = require('dw/system/Site').getCurrent();
var utils = require('~/cartridge/experience/utils/utils');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var HTTPClient = require('dw/net/HTTPClient');

server.get('info', server.middleware.https, function (req, res, next) {
    var publicId = req.querystring.publicId;
    var type = req.querystring.type;
    var rType = req.querystring.rType;
    var cloudName = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCloudName');
    if (publicId) {
        var info = getAssetInfo(publicId, type, rType, cloudName);
        res.json({
            status: 'ok',
            info: info 
        }
        );
    } else {
        res.json({
            status: 'error',
            message: 'missing publicId'
        }
        );
    }
    next();
});

function getAssetInfo(publicId, type, rType, cloudName) {
    var httpClient = new HTTPClient();
    httpClient.open('GET', 'https://api.cloudinary.com/v1_1/' + cloudName + '/resources/' + rType + '/' + type + '/' + publicId);
    var authStr = utils.createBasicAuthStr();
    httpClient.setRequestHeader('Authorization', "Basic " + authStr);
    httpClient.setRequestHeader('Content-Type', 'application/json');
    httpClient
    httpClient.send();
    if (httpClient.statusCode === 200) {
        return JSON.parse(httpClient.getText());
    } else {
        return null;
    }
}





module.exports = server.exports();
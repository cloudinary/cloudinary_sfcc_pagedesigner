'use strict';

var server = require('server');
var currentSite = require('dw/system/Site').getCurrent();
var utils = require('*/cartridge/experience/utils/utils');

// var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * Parses the responce from cloudinary
 * @param {Object} response response object
 * @returns {[]|number[]} breakpoints array
 */
function getBreackpointsFromResponse(response) {
    if (response.responsive_breakpoints && response.responsive_breakpoints.length > 0) {
        var resBreakpoints = [];
        response.responsive_breakpoints.forEach(function (br) {
            var breakpoints = br.breakpoints;
            if (breakpoints && Array.isArray(breakpoints)) {
                breakpoints.forEach(function (b) {
                    resBreakpoints.push(b.width);
                });
            }
        });
        return resBreakpoints;
    }
    return [1280, 768, 375];
}
/**
 * Retrives the best breakpoint for an asset
 * @param {string} publicId assets publicId
 * @returns {[]|number[]} array of breakpoints
 */
function getBreackpoints(publicId) {
    var body = {
        timestamp: (Date.now() / 1000).toFixed(),
        public_id: publicId,
        type: 'upload',
        responsive_breakpoints: [
            {
                bytes_step: 20000,
                max_width: 1000,
                max_images: 20,
                min_width: 200
            }]
    };
    body.signature = utils.addSignatureToBody(body);
    body.responsive_breakpoints = utils.stringifyJson(body.responsive_breakpoints);
    body.api_key = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerAPIkey');
    var r = utils.callService(body, 'image', 'explicit');
    if (r.ok) {
        var result = r.message;
        return getBreackpointsFromResponse(result);
    }
    return [1280, 768, 375];
}

server.get('Points', server.middleware.https, function (req, res, next) {
    var publicId = req.querystring.publicId;
    if (publicId) {
        var brs = getBreackpoints(publicId);
        res.json({
            status: 'ok',
            breakpoints: brs
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

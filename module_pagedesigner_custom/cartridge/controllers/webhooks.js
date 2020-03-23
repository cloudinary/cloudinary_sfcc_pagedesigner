
var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var currentSite = require('dw/system/Site').getCurrent();
var utils = require('~/cartridge/experience/utils/utils');


server.post('eager', function (req, res, next) {
    let sig = req.httpHeaders.get('x-cld-signature');
    let ts = req.httpHeaders.get('x-cld-timestamp');
    let valid = utils.verifySignature(req.body, ts, sig);
    if (valid) {
        console.log(valid);

    }
    next();
});
module.exports = server.exports();
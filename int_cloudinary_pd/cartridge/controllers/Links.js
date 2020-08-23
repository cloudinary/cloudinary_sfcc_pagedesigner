'use strict';

var server = require('server');
var currentSite = require('dw/system/Site').getCurrent();
var URLUtils = require('dw/web/URLUtils');
var URLAction = require('dw/web/URLAction');
var URLParamter = require('dw/web/URLParameter');

server.get('url', server.middleware.https, function (req, res, next) {
    var linkArr = (req.querystring && req.querystring.linkData) ? JSON.parse(decodeURIComponent(req.querystring.linkData)) : null;
    if (linkArr && linkArr.length > 0) {
        // eslint-disable-next-line new-cap
        var url = new URLUtils.abs(new URLAction(linkArr[0], currentSite.name), new URLParamter(linkArr[1], linkArr[2]));
        var link = {
            status: 'ok',
            url: url.toString()
        };
        res.json(link);
    } else {
        res.json({ status: 'error', message: 'no data' });
    }
    next();
});

module.exports = server.exports();

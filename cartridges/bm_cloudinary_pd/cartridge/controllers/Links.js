'use strict';

var guard = require('~/cartridge/scripts/guard');

var params = request.httpParameterMap;

function url() {
    var Response = require('~/cartridge/scripts/util/Response');

    var linkArr = (params.linkData) ? JSON.parse(decodeURIComponent(params.linkData.value)) : null;
    if (linkArr && linkArr.length > 0) {
        // eslint-disable-next-line new-cap
        var link = {
            status: 'ok',
            url: linkArr.toString()
        };
        Response.renderJSON(link);
    } else {
        Response.renderJSON({ status: 'error', message: 'no data' });
    }
};

exports.url = guard.ensure(['https', 'get'], url);

'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var cld = require('*/cartridge/experience/components/assets/mediaLibrary');

module.exports.render = function (context) {
    var model = new HashMap();
    model.viewmodel = cld.preRender(context, 'cld_image');
    model.headline = context.content.headline;
    return new Template('experience/components/assets/example').render(model).text;
};

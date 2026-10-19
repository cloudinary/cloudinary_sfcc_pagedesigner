'use strict';

module.exports.init = function (editor) {
    var PageMgr = require('dw/experience/PageMgr');
    var HashMap = require('dw/util/HashMap');
    var cloudinaryApi = require('*/cartridge/scripts/cloudinary/cloudinaryApi');
    var cloudinaryPDUtils = require('~/cartridge/experience/utils/cloudinaryPDUtils');

    editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
    editor.configuration.put('cname', cloudinaryApi.data.getCloudinaryCNAME());
    editor.configuration.put('breakpoints', JSON.stringify(cloudinaryPDUtils.parseFormFactorBreakpoints()));

    var conf = new HashMap();
    conf.put('type', 'image');
    var mediaPicker = PageMgr.getCustomEditor('cloudinary.mediaSelector', conf);
    editor.dependencies.put('mediaPicker', mediaPicker);

    var studioWidget = PageMgr.getCustomEditor('cloudinary.studioWidget', new HashMap());
    editor.dependencies.put('studioWidget', studioWidget);
};

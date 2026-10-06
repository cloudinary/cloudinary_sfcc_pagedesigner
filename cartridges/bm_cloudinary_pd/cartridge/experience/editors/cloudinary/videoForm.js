'use strict';

module.exports.init = function (editor) {
    var PageMgr = require('dw/experience/PageMgr');
    var HashMap = require('dw/util/HashMap');
    var cloudinaryApi = require('*/cartridge/scripts/cloudinary/cloudinaryApi');
    var cloudinaryPDUtils = require('~/cartridge/experience/utils/cloudinaryPDUtils');

    editor.configuration.put('cloudName', cloudinaryApi.data.getCloudName());
    editor.configuration.put('cname', cloudinaryApi.data.getCloudinaryCNAME());

    // Pass default player option values from site preference to the widget
    var currentSite = require('dw/system/Site').getCurrent();
    var playerOptionsRaw = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerVideoPlayerOptions');
    var playerOptions = { autoplay: false, muted: false, loop: false, controls: true };
    if (playerOptionsRaw) {
        try {
            var parsed = JSON.parse(playerOptionsRaw);
            for (var k of ['autoplay', 'muted', 'loop', 'controls']) {
                if (k in parsed) {
                    playerOptions[k] = !!parsed[k];
                }
            }
        } catch (e) { /* keep defaults on parse error */ }
    }
    editor.configuration.put('playerOptions', JSON.stringify(playerOptions));

    editor.configuration.put('breakpoints', JSON.stringify(cloudinaryPDUtils.parseFormFactorBreakpoints()));

    var conf = new HashMap();
    conf.put('type', 'video');
    var mediaPicker = PageMgr.getCustomEditor('cloudinary.mediaSelector', conf);
    editor.dependencies.put('mediaPicker', mediaPicker);

    var advancedConfig = PageMgr.getCustomEditor('cloudinary.advancedVideoForm', new HashMap());
    editor.dependencies.put('advancedConfig', advancedConfig);
};

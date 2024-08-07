'use strict';

var currentSite = require('dw/system/Site').getCurrent();

var data = {
    getAPIKey: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerAPIkey');
    },

    getCloudinaryCNAME: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCNAME');
    },

    getCloudName: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCloudName');
    },
    getIframeEnv: function () {
        return currentSite.getCustomPreferenceValue('CloudinaryPageDesignerEnv');
    }
};

/**
 *  gets the video global transformation settings
 *  @returns {HashMap} hashmap of global transformation values.
 */
function getImageGlobalTransforms() {
    var HashMap = require('dw/util/HashMap');
    var trans = new HashMap();
    trans.put('dpr', currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsDPR').getValue());
    trans.put('fetchFormat', currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsFormat').getValue());
    trans.put('quality', currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsQuality').getValue());
    trans.put('raw_transformation', currentSite.getCustomPreferenceValue('CloudinaryImageTransformations'));
    return trans;
}

module.exports.data = data;
module.exports.globalTransform = getImageGlobalTransforms;

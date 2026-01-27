'use strict';

var currentSite = require('dw/system/Site').getCurrent();

/**
 * Returns the domain with protocol from full URL.
 * @param {string} originalPath - full URL
 * @returns {string} domain with protocol
 */
function getOrigin(originalPath) {
    if (!originalPath) return '';

    var match = originalPath.match(/^(https?:\/\/[^\/]+)/);
    if (match && match[1]) {
        return match[1];
    }
    return originalPath;
}


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
    },

    getIframeEnvOrigin: function (){
        return getOrigin(currentSite.getCustomPreferenceValue('CloudinaryPageDesignerEnv'))
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

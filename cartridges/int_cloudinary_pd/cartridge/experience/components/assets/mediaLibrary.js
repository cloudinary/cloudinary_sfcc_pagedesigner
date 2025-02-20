'use strict';


/**
 * Replaces the global transformations so if they change
 * @param {string} trans serialized JSON
 * @returns {string} serialized JSON
 */
function replaceGlobalTransformations(trans) {
    var currentSite = require('dw/system/Site').getCurrent();

    var t = JSON.parse(trans);
    var global = {
        dpr: currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsDPR').getValue(),
        fetchFormat: currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsFormat').getValue(),
        quality: currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsQuality').getValue(),
        raw_transformation: currentSite.getCustomPreferenceValue('CloudinaryImageTransformations')
    };
    for (var key in global) {
        if (global[key] === 'none') {
            delete global[key];
        }
    }
    t[0] = global;
    return JSON.stringify(t);
}

/**
 * produces a random string
 * @param {number} length the length of the string
 * @returns {string} random string
 */
function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * sanitizes the string for HTML id use
 * @param {string} str the string to clean
 * @returns {string} a clean string
 */
function idSafeString(str) {
    return 'id' + str.toLowerCase().replace(/[^a-zA-Z0-9-:.]/, '');
}

/**
 * generate breakpoints for images
 * @param {Object} viewmodel the string to clean
 * @returns {string} a clean string
 */
function generateBreakPoints(viewmodel) {
    var currentSite = require('dw/system/Site').getCurrent();

    let brs = [];
    const breakPoints = 'CloudinaryPageDesignerBreakpoints' in currentSite.preferences.custom ? JSON.parse(currentSite.getCustomPreferenceValue('CloudinaryPageDesignerBreakpoints')) : null;
    const srcNoDpr = viewmodel.src.replace(/dpr_[^,]*,/, '');
    if (breakPoints) {
        breakPoints.forEach((br) => {
            const addBreakpoint = 'image/upload/c_scale,w_' + br;
            const splitUrl = srcNoDpr.split('image/upload/');
            const breakpointUrl = splitUrl[0] + addBreakpoint + ',' + splitUrl[1];
            brs.push(breakpointUrl + ' ' + br + 'w');
        })
    }

    if (brs.length > 0) {
        return brs.join(',');
    }
}

module.exports.preRender = function (context, editorId) {
    var Logger = require('dw/system/Logger');
    var URLUtils = require('dw/web/URLUtils');
    var constants = require('~/cartridge/experience/utils/cloudinaryPDConstants').cloudinaryPDConstants;
    var currentSite = require('dw/system/Site').getCurrent();
    
    var viewmodel = {};
    if (context.content[editorId] && context.content[editorId].imageUrl) {
        var cname = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCNAME');
        viewmodel.id = idSafeString(context.content[editorId].public_id + randomString(12));
        viewmodel.publicId = context.content[editorId].public_id;
        viewmodel.cloudName = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCloudName');
        if (cname !== 'res.cloudinary.com') {
            viewmodel.cname = cname;
        }
        viewmodel.placeholder = context.content[editorId].placeholderUrl || context.content[editorId].imageUrl;
        viewmodel.placeholder = viewmodel.placeholder + constants.CLD_TRACKING_PARAM;
        viewmodel.breakpoints = context.content[editorId].breakpoints;
        viewmodel.sizes = context.content[editorId].sizes || '90vw';
        viewmodel.src = context.content[editorId].imageUrl + constants.CLD_TRACKING_PARAM;
        viewmodel.cldTrackingParam = constants.CLD_TRACKING_PARAM;
        if (context.content[editorId].imageLinkData) {
            try {
                const imageLink = JSON.parse(context.content[editorId].imageLinkData);
                viewmodel.imageLink = URLUtils.https.apply(null, imageLink);
            } catch (error) {
                Logger.error('Error while parsing JSON at {0} : {1}', error.lineNumber, error);
            }
        }
        viewmodel.altText = context.content[editorId].alt;
        if (context.content[editorId].isTransformationOverride) {
            viewmodel.transformation = context.content[editorId].transformation;
        } else {
            viewmodel.transformation = replaceGlobalTransformations(context.content[editorId].transformation);
        }
        viewmodel.srcset = generateBreakPoints(viewmodel);
    }
    return viewmodel;
};

module.exports.render = function (context) {
    var Template = require('dw/util/Template');
    var HashMap = require('dw/util/HashMap');
    var model = new HashMap();
    model.viewmodel = module.exports.preRender(context, 'image_sel');
    return new Template('experience/components/assets/cloudinaryImage').render(model).text;
};

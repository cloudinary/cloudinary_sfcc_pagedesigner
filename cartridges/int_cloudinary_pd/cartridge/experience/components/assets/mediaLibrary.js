'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var currentSite = require('dw/system/Site').getCurrent();
var URLUtils = require('dw/web/URLUtils');
var URLAction = require('dw/web/URLAction');
var URLParamter = require('dw/web/URLParameter');

/**
 * build a url from array
 * @param {Array} linkArr the infor to build the links from
 * @returns {string|null} the url to link to or null
 */
function buildLinkUrl(linkArr) {
    if (linkArr && linkArr.length > 0) {
        // eslint-disable-next-line new-cap
        return new URLUtils.url(new URLAction(linkArr[0], currentSite.name), new URLParamter(linkArr[1], linkArr[2]));
    }
    return null;
}

/**
 * Replaces the global transformations so if they change
 * @param {string} trans serialized JSON
 * @returns {string} serialized JSON
 */
function replaceGlobalTransformations(trans) {
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

module.exports.preRender = function (context, editorId) {
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
        viewmodel.breakpoints = context.content[editorId].breakpoints;
        viewmodel.sizes = context.content[editorId].sizes;
        viewmodel.src = context.content[editorId].imageUrl;
        if (context.content[editorId].imageLinkData) {
            viewmodel.imageLink = buildLinkUrl(JSON.parse(context.content[editorId].imageLinkData));
        }
        viewmodel.altText = context.content[editorId].alt;
        if (context.content[editorId].isTransformationOverride) {
            viewmodel.transformation = context.content[editorId].transformation;
        } else {
            viewmodel.transformation = replaceGlobalTransformations(context.content[editorId].transformation);
        }
    }
    return viewmodel;
};

module.exports.render = function (context) {
    var model = new HashMap();
    model.viewmodel = module.exports.preRender(context, 'image_sel');
    return new Template('experience/components/assets/cloudinaryImage').render(model).text;
};

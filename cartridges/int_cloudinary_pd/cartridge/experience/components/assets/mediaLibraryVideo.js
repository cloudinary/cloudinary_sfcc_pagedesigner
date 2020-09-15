'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var currentSite = require('dw/system/Site').getCurrent();
var utils = require('*/cartridge/experience/utils/utils');
var log = require('dw/system').Logger.getLogger('Cloudinary', '');

if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, 'assign', {
        // eslint-disable-next-line no-unused-vars
        value: function assign(target, varArgs) { // .length of function is 2
            if (target === null || target === undefined) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource !== null && nextSource !== undefined) {
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

/**
 * checks if object is empty
 * @param {Object} obj  the object ot check
 * @returns {boolean|boolean} true if empty
 */
function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * gets transformations from global settings
 * @returns {Array} array of transformations
 */
function getVideoTransfomations() {
    var quality = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsQuality');
    var bitRate = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsBitRate');
    var global = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformations');
    var transformations = {};
    var tr = [];
    if (quality !== null && quality.value !== 'none') {
        transformations.quality = quality.value;
    }
    if (bitRate !== null && bitRate.value !== 'default') {
        transformations.bit_rate = bitRate.value;
    }
    if (!isObjectEmpty(transformations)) {
        tr.push(transformations);
    }
    if (global) {
        tr.push({ raw_transformation: global });
    }
    return tr;
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
 * rebuild the transformation for api cals
 * @param {Array} transformations array of t
 * @param {Array} global global transformations
 * @returns {Array} array of transformations
 */
function rebuildTransformations(transformations, global) {
    var trns = transformations.map(function (tr) {
        if (tr.overlay && tr.overlay.resource_type) {
            // eslint-disable-next-line no-param-reassign
            delete tr.overlay.resource_type;
        }
        return tr;
    });
    return global.concat(trns);
}

/**
 * build a stringfrom the global transformations
 * @param {Object} global global transformations object
 * @returns {string} global transformations string
 */
function buildGlobalStr(global) {
    var str = '';
    if (global) {
        // eslint-disable-next-line guard-for-in
        for (var key in global) {
            if (key === 'quality') {
                str += 'q_' + global[key];
            }
            if (key === 'bit_rate') {
                str += (str === '') ? ',br_' + global[key] : 'br_' + global[key];
            }
            if (key === 'raw_transformation') {
                str += (str === '') ? ',' + global[key] : global[key];
            }
        }
    }
    return str;
}

/**
 * Maks an egger transformation API call
 * @param {Object} conf configuration object
 * @param {string} publicId the asset public id
 * @returns {Object} the configuration object
 */
function callEagerTransformations(conf, publicId) {
    try {
        var str = conf.transStr;
        var trans = Array.isArray(conf.sourceConfig.transformation) ? conf.sourceConfig.transformation : [];
        if (!conf.isTransformationOverride) {
            var global = getVideoTransfomations();
            trans = rebuildTransformations(trans, global);
            var globalStr = buildGlobalStr(global[0]);
            if (globalStr !== '') {
                str = globalStr + ',' + str;
            }
        }
        // eslint-disable-next-line no-param-reassign
        conf.sourceConfig.transformation = trans;
        var body = {
            timestamp: (Date.now() / 1000).toFixed(),
            type: 'upload',
            public_id: publicId,
            eager: str,
            eager_async: true
        };
        body.signature = utils.addSignatureToBody(body);
        body.api_key = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerAPIkey');
        var res = utils.callService(body, 'video', 'explicit');
        if (!res.ok) {
            log.error('Error call explicit video transformations');
            log.error(res.message);
        }
    } catch (e) {
        log.error('Error call explicit video transformations');
        log.error(e.message);
    }
    return conf;
}

/**
 * Does the value has an video asset
 * @param {Object} val SFCC value
 * @returns {boolean} true if if it has a value
 */
function hasVideo(val) {
    return val.formValues && val.formValues.video && val.formValues.video.asset;
}

module.exports.preRender = function (context, editorId) {
    var val = context.content[editorId];
    var viewmodel = {};
    if (!val.playerConf.empty && hasVideo(val)) {
        var cname = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCNAME');
        var conf = JSON.parse(val.playerConf);
        var publicId = conf.publicId;
        var format = currentSite.getCustomPreferenceValue('CloudinaryVideoFormat');
        if (format !== null && format.value !== 'none') {
            conf.sourceType = format;
        }
        if (cname !== 'res.cloudinary.com') {
            viewmodel.cname = cname;
        }
        conf = callEagerTransformations(conf, publicId);
        viewmodel.cloudName = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCloudName');
        viewmodel.public_id = publicId;
        viewmodel.id = idSafeString(randomString(16));
        viewmodel.playerConf = JSON.stringify(conf);
    }
    return viewmodel;
};

module.exports.render = function (context) {
    var model = new HashMap();
    model.viewmodel = module.exports.preRender(context, 'asset_sel');
    return new Template('experience/components/assets/cloudinaryVideo').render(model).text;
};

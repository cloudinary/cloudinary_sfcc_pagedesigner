'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var currentSite = require('dw/system/Site').getCurrent();
var utils = require('~/cartridge/experience/utils/utils');
var log = require('dw/system').Logger.getLogger('Cloudinary', '');

if (typeof Object.assign !== 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
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

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function getVideoTransfomations() {
  var quality = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsQuality');
  var bitRate = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsBitRate');
  var global = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformations');
  var transformations = {}
  var tr = [];
  if (quality !== null && quality.value !== 'none') {
    transformations.quality = quality.value;
  }
  if (bitRate !== null && bitRate.value !== 'default') {
    transformations.bit_rate = bitRate.value
  }
  if (!isObjectEmpty(transformations)) {
    tr.push(transformations)
  }
  if (global) {
    tr.push({ raw_transformation: global });
  }
  return tr;
}
function randomString(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
function idSafeString(str) {
  return 'id' + str.toLowerCase().replace(/[^a-zA-Z0-9-:\.]/, '');
}

function rebuildTransformations(transformations, global) {
  var trns = transformations.map(function (tr) {
    if (tr.overlay && tr.overlay.resource_type) {
      delete tr.overlay.resource_type;
    }
    return tr;
  });
  return global.concat(trns);
}

function buildGlobalStr(global) {
  var str = '';
  if (global) {
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

function callEagerTransformations(conf, publicId) {
  try {
    var str = conf.transStr
    var trans = Array.isArray(conf.sourceConfig.transformation) ? conf.sourceConfig.transformation : [];
    if (!conf.isTransformationOverride) {
      var global = getVideoTransfomations();
      trans = rebuildTransformations(trans, global);
      var globalStr = buildGlobalStr(global[0]);
      if (globalStr !== '') {
        str = globalStr + ',' + str;
      }
    }
    conf.sourceConfig.transformation = trans;
    var body = {
      timestamp: (Date.now() / 1000).toFixed(),
      type: "upload",
      public_id: publicId,
      eager: str,
      eager_async: true
    }
    body.signature = utils.addSignatureToBody(body);
    body.api_key = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerAPIkey');
    var res = utils.callService(body, 'video', 'explicit');
    if (!res.ok) {
      log.error('Error call explicit video transformations');
      log.error(res.message);
    }
    return conf;
  } catch (e) {
    log.error('Error call explicit video transformations');
    log.error(e.message);
  }
}
function asVideo(val) {
  return val.formValues && val.formValues.video && val.formValues.video.asset;
}

module.exports.render = function (context) {
  let val = context.content.asset_sel;
  let model = new HashMap();
  if (!val.playerConf.empty && asVideo(val)) {
  let cname = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCNAME');
    let viewmodel = {};
    var conf = JSON.parse(val.playerConf);
    var publicId = conf.publicId;
    var format = currentSite.getCustomPreferenceValue('CloudinaryVideoFormat');
    if (format !== null && format.value !== 'none') {
      conf.sourceType = format
    }
    if (cname !== 'res.cloudinary.com') {
      viewmodel.cname = cname;
    }
    conf = callEagerTransformations(conf, publicId);
    viewmodel.cloudName = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCloudName');
    viewmodel.public_id = publicId;
    viewmodel.id = idSafeString(randomString(16));
    viewmodel.playerConf = JSON.stringify(conf);
    model.viewmodel = viewmodel;
  }
  return new Template('experience/components/assets/cloudinary_video').render(model).text;
};

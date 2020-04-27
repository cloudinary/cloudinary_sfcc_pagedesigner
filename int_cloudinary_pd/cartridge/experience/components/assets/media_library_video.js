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

function rebuildTransformations(transformations) {
  var global = getVideoTransfomations();
  var trns = transformations.map(function (tr) {
    if (tr.overlay && tr.overlay.resource_type) {
      delete tr.overlay.resource_type;
    }
    return tr;
  });
  return global.concat(trns);
}

function callEagerTransformations(str, publicId) {
  try {
/*     var trans = Array.isArray(conf.sourceConfig.transformation) ? conf.sourceConfig.transformation : [];
    if (!conf.isTransformationOverride) {
      trans = rebuildTransformations(trans);
    }
    conf.sourceConfig.transformation = trans; */
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

module.exports.render = function (context) {
  let model = new HashMap();
  let viewmodel = {};
  let val = context.content.asset_sel;
  if (!val.playerConf.empty) {
    var conf = JSON.parse(val.playerConf);
    var format = currentSite.getCustomPreferenceValue('CloudinaryVideoFormat');
    if (format !== null && format.value !== 'none') {
      conf.sourceType = format
    }
    conf = callEagerTransformations(conf.transStr, conf.publicId);
    viewmodel.cloudName = val.cloudName;
    viewmodel.public_id = val.playerConf.publicId;
    viewmodel.id = idSafeString(conf.public_id + randomString(12));
    viewmodel.playerConf = JSON.stringify(conf);
  }
  model.viewmodel = viewmodel;
  return new Template('experience/components/assets/cloudinary_video').render(model).text;

};

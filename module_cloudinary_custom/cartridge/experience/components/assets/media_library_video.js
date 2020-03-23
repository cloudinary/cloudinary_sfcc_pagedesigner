'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var currentSite = require('dw/system/Site').getCurrent();
var utils = require('~/cartridge/experience/utils/utils');

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
  var format = currentSite.getCustomPreferenceValue('CloudinaryVideoFormat');
  var quality = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsQuality');
  var bitRate = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsBitRate');
  var global = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformations');
  var videoPlayerConf = {
  }
  var transformations = {}
  if (quality !== null && quality.value !== 'none') {
    transformations.quality = quality.value;
  }
  if (bitRate !== null && bitRate.value !== 'none') {
    transformations.bitRate = bitRate.value
  }
  if (format !== null && format.value !== 'none') {
    videoPlayerConf.sourceType = format
  }
  if (!isObjectEmpty(transformations)) {
    videoPlayerConf.transformations = [transformations];
  }

  return videoPlayerConf;
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
  transformations.map(function(tr) {
    if (tr.overlay && tr.overlay.resource_type) {
      delete tr.overlay.resource_type;
    }
    return tr;
  })

}

function callEagerTransformations(videoPlayerConf) {
  var conf = JSON.parse(videoPlayerConf);
  var trans = conf.sourceConfig.transformation
  if (trans.length > 0) {
    var body = {
      timestamp: (Date.now() / 1000).toFixed(),
      type: "upload",
      public_id: conf.publicId,
      eager: utils.stringifyJson(rebuildTransformations(trans)),
      eager_async: true
    }
    body.signature = utils.addSignatureToBody(body);
    body.api_key = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerAPIkey');
    var res = utils.callService(body, 'video', 'explicit');
    return res.ok;
  }
}

module.exports.render = function (context) {
  let model = new HashMap();
  let viewmodel = {};
  let val = context.content.asset_sel;
  if (!val.playerConf.empty) {
    callEagerTransformations(val.playerConf);
    viewmodel.cloudName = val.cloudName;
    viewmodel.public_id = val.playerConf.publicId;
    viewmodel.id = idSafeString(val.public_id + randomString(12));
    viewmodel.playerConf = val.playerConf;
  }
  model.viewmodel = viewmodel;
  return new Template('experience/components/assets/cloudinary_video').render(model).text;

};

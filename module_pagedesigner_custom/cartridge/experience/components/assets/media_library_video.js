'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var currentSite = require('dw/system/Site').getCurrent();

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

function getImageUrlFromAsset(asset) {
  if (asset.derived && asset.derived.length > 0) {
    return asset.derived[0].secure_url;
  }
  return asset.secure_url;
}

function idSafeString(str) {
  return 'id' + str.toLowerCase().replace(/[^a-zA-Z0-9-:\.]/, '');
}

function randomString(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function buildImageOverlay(conf) {
  return {
    overlay: conf.id,
    opacity: conf.opacity,
    gravity: conf.position,
    width: conf.scale,
    x: conf.xOffset,
    y: conf.yOffset
  }
}

function buildTextOverlay(conf) {
  return {
    overlay: {
      font_family: conf.font,
      text: conf.text,
      font_size: conf.fontSize,
    },
    y: conf.yPos,
    x: conf.xPos,
    color: '#' + conf.color
  }
}

module.exports.render = function (context) {
  let model = new HashMap();
  let viewmodel = {};
  viewmodel.type = 'video';
  var globalPart = getVideoTransfomations();
  let val = context.content.asset_sel || {};
  if (val.secure_url) {
    viewmodel.public_id = val.public_id;
    viewmodel.id = idSafeString(val.public_id + randomString(12));
    var videoPlayerConf = getVideoTransfomations();
    viewmodel.url = val.secure_url;
    viewmodel.autoplay = (context.content.controls_autoplay) ? 'autoplay' : '';
    viewmodel.showControls = (context.content.controls_showcontrols) ? 'controls' : '';
    viewmodel.loop = (context.content.controls_loopvideo) ? 'loop' : '';
    viewmodel.muted = (context.content.controls_muted) ? 'muted' : '';
    viewmodel.jumpControls = context.content.controls_jump;
    viewmodel.theme = context.content.controls_theme.toLowerCase();
    viewmodel.cloudName = val.cloudName;
    var controlBar = null;
    if (context.content.controls_no_fullscreen === true) {
      controlBar = {pictureInPictureToggle: false};
      controlBar.fullscreenToggle = false;
    }
    if (context.content.controls_no_volume === true) {
      if (controlBar == null) {
        controlBar = {pictureInPictureToggle: false};
      }
      controlBar.volumePanel = false;
    }
    if (controlBar !== null) {
      viewmodel.controlBar = JSON.stringify(controlBar);
    }
    if (context.content.overlay && context.content.overlay.enable && context.content.overlay.id) {
      var imageOverlay = buildImageOverlay(context.content.overlay);
      if (!videoPlayerConf.transformations) {
        videoPlayerConf.transformations = [];
      }
      videoPlayerConf.transformations.push(imageOverlay);
    }
    if (context.content.textOverlay && context.content.textOverlay.enable && context.content.textOverlay.text) {
      var textOverlay = buildTextOverlay(context.content.textOverlay);
      if (!videoPlayerConf.transformations) {
        videoPlayerConf.transformations = [];
      }
      videoPlayerConf.transformations.push(textOverlay);
    } 
    viewmodel.transformations = JSON.stringify(videoPlayerConf.transformations);

  } else {
    viewmodel.url = 'https://cloudinary-res.cloudinary.com/image/upload/c_scale,fl_attachment,w_100/v1/logo/for_white_bg/cloudinary_icon_for_white_bg.png';
  }

  model.viewmodel = viewmodel;
  return new Template('experience/components/assets/media_library').render(model).text;

};

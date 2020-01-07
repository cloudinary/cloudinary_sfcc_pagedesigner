'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var currentSite = require('dw/system/Site').getCurrent();

function getVideoTransfomations() {
	var format = currentSite.getCustomPreferenceValue('CloudinaryVideoFormat');
	var qulaty = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsQuality');
  var bitRate = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsBitRate');
  var global = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformations');
  var videoPlayerConf = {
    sourceType: format,
    transformations: {
      quality: qulaty,
      bit_rate: bitRate
    }
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
  return 'id' + str.toLowerCase().replace(/[^a-zA-Z0-9-:\.]/,'');
}

module.exports.render = function (context) {
  let model = new HashMap();
  let viewmodel = {};
  viewmodel.type = 'video';
  var globalPart = getVideoTransfomations();
  let val = context.content.asset_sel || {};
  if (val.secure_url) {
    viewmodel.public_id = val.public_id;
    viewmodel.id = idSafeString(val.public_id);
    viewmodel.videoPlayerConf = getVideoTransfomations();
    viewmodel.url = val.secure_url;
    viewmodel.cloudName = val.cloudName;
  } else {
    viewmodel.url = 'https://cloudinary-res.cloudinary.com/image/upload/c_scale,fl_attachment,w_100/v1/logo/for_white_bg/cloudinary_icon_for_white_bg.png';
  }

  model.viewmodel = viewmodel ;
  return new Template('experience/components/assets/media_library').render(model).text;

};

'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var currentSite = require('dw/system/Site').getCurrent();

function getImageSettingUrlPart() {
	var dpr = currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsDPR');
	var format = currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsFormat');
	var qulaty = currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsQuality');
	var altText = currentSite.getCustomPreferenceValue('CloudinaryImageUseAltText');
	var urlPart = '';
	if (dpr && dpr !== 'none') {
		urlPart += dpr + '/';
	}
	if (format && format !== 'none') {
		urlPart += format + '/';
	}
	if (qulaty && qulaty !== 'none') {
		urlPart += qulaty + '/';
	}
	return urlPart;
} 

function getImageUrlFromAsset(asset) {
  if (asset.derived && asset.derived.length > 0) {
    return asset.derived[0].secure_url;
  } 
  return asset.secure_url;
}


module.exports.render = function (context) {
  let model = new HashMap();
  let viewmodel = {};
  viewmodel.type = 'image';
  var globalPart = getImageSettingUrlPart();
  let val = context.content.asset_sel;
  if (val.secure_url) {
    var assetUrl = getImageUrlFromAsset(val);
    var globalPart = getImageSettingUrlPart();
    var fileName = val.secure_url.substr(val.secure_url.lastIndexOf('/')+1);
    var u = assetUrl.replace(/v[0-9]+/, '').replace(fileName, '');
    viewmodel.url = u + globalPart + fileName;
  } else {
    viewmodel.url = 'https://cloudinary-res.cloudinary.com/image/upload/c_scale,fl_attachment,w_100/v1/logo/for_white_bg/cloudinary_icon_for_white_bg.png"';
  }

  model.viewmodel = viewmodel ;
  return new Template('experience/components/assets/media_library').render(model).text;

};

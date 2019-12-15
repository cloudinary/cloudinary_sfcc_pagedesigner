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

function getPlaceholderImage(type) {
  var placeholderImageOptions = {
    'vectorize': 'e_vectorize/q_1',
    'pixelate': 'e_pixelate/q_1/f_auto',
    'blur': 'e_blur:2000/q_1/f_auto',
    'solid': 'w_iw_div_2/ar_1/c_pad/b_auto/c_crop/w_10/h_10/g_north_east/w_iw/h_ih/c_fill/f_auto/q_auto'
  }
  return placeholderImageOptions[type] || placeholderImageOptions['blur'];
}

module.exports.render = function (context) {
  let model = new HashMap();
  let viewmodel = {};
  let plType = context.content.placeholderImageType;
  viewmodel.type = 'image';
  var globalPart = getImageSettingUrlPart();
  viewmodel.altText = context.content.alt || 'alt';
  let val = context.content.asset_sel;
  if (val.secure_url) {
    var assetUrl = getImageUrlFromAsset(val);
    var globalPart = getImageSettingUrlPart();
    var fileName = val.secure_url.substr(val.secure_url.lastIndexOf('/')+1);
    var u = assetUrl.replace(/v[0-9]+[\/]/, '').replace(fileName, '');
    viewmodel.url = u + globalPart + fileName;
    viewmodel.placeholder = u + getPlaceholderImage(plType) + '/' + fileName;
  } else {
    viewmodel.url = 'https://cloudinary-res.cloudinary.com/image/upload/c_scale,fl_attachment,w_100/v1/logo/for_white_bg/cloudinary_icon_for_white_bg.png"';
  }

  model.viewmodel = viewmodel ;
  return new Template('experience/components/assets/media_library').render(model).text;

};

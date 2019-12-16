'use strict';
var MessageDigest = require('dw/crypto/MessageDigest');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');
var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var currentSite = require('dw/system/Site').getCurrent();
var Logger = require('dw/system').Logger.getLogger('Cloudinary', '');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var cloudName = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCloudName');




var cloudinaryService = LocalServiceRegistry.createService("cloudinaryPageDesignerAPI", {
  createRequest: function (service, param) {
    service.setAuthentication('NONE');
    return param || null;
  },
  parseResponse: function (service, client) {
    return client;
  }
});
var serviceURL = cloudinaryService.URL;
function addSignatureToBody(body) {
  var hasher = new MessageDigest(MessageDigest.DIGEST_SHA_1);
  var fieldsArray = [];

  for (var i in body) {
    if (body[i] == '' || body[i] == null) {
      delete body[i];
    }
    else if(Array.isArray(body[i])) {
      fieldsArray.push(i + '=' + body[i].map(function(el) {
        return JSON.stringify(el);
      }).join(','));
    }
    else {
      fieldsArray.push(i + '=' + body[i]);
    }
  }

  var fields = fieldsArray.sort().join('&');
  var toSign = new Bytes(fields + currentSite.getCustomPreferenceValue('CloudinaryPageDesignerSecretKey'), "UTF-8");
  var signature = Encoding.toHex(hasher.digestBytes(toSign));
  return signature;
};

function callService(body, fileType, callType) {
  var serviceResponse,
    cloudinaryResponse = {
      ok: false,
      message: ''
    };

  try {
    cloudinaryService.setRequestMethod('POST');
    cloudinaryService.setURL(serviceURL + '/' + cloudName + '/' + fileType + '/' + callType);
    cloudinaryService.addHeader('Content-Type', 'application/json');

    serviceResponse = cloudinaryService.call(JSON.stringify(body));

    if (serviceResponse.ok) {
      if (serviceResponse.object.statusCode == '200') {
        cloudinaryResponse.ok = true;
        cloudinaryResponse.message = serviceResponse.object.text;
      } else {
        cloudinaryResponse.message = serviceResponse.object.errorText
      }
    } else {
      cloudinaryResponse.message = serviceResponse.errorMessage
    }

  } catch (e) {
    Logger.error(e);
    cloudinaryResponse.message = e.message
  }
  return cloudinaryResponse;
};


function getBrackpoints(publicId) {
  var body = {
    timestamp: (Date.now() / 1000).toFixed(),
    public_id: publicId,
    type: 'upload',
    responsive_breakpoints: [{
      create_derived: false, bytes_step: 20000,
      min_width: 200, max_width: 1000,
      max_images: 20
    }]
  }
  body.signature = addSignatureToBody(body);
  body.api_key = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerAPIkey');
  var res = callService(body, 'image', 'explicit');
  return res;
}

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
    var breakpoints = getBrackpoints(context.content.asset_sel.public_id)
    var globalPart = getImageSettingUrlPart();
    var fileName = val.secure_url.substr(val.secure_url.lastIndexOf('/') + 1);
    var u = assetUrl.replace(/v[0-9]+[\/]/, '').replace(fileName, '');
    viewmodel.url = u + globalPart + fileName;
    viewmodel.placeholder = u + getPlaceholderImage(plType) + '/' + fileName;
  } else {
    viewmodel.url = 'https://cloudinary-res.cloudinary.com/image/upload/c_scale,fl_attachment,w_100/v1/logo/for_white_bg/cloudinary_icon_for_white_bg.png"';
  }

  model.viewmodel = viewmodel;
  return new Template('experience/components/assets/media_library').render(model).text;

};

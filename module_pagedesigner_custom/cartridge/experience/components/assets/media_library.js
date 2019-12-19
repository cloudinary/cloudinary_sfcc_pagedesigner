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
    else if (Array.isArray(body[i])) {
      fieldsArray.push(i + '=' + body[i].join(','));
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

function getBreackpointsHard(asset, overlay) {
  var assetUrl = getImageUrlFromAsset(asset);
  var fileName = getFileName(assetUrl);
  var baseUrl = getBaseUrlPart(assetUrl, fileName);
  if (overlay && overlay.enable) {
    baseUrl += buildOverlayUrlPart(overlay);
  }
  var breakpoints = [1280, 768, 375];
  var brs = [];
  breakpoints.forEach(function(br) {
    brs.push(baseUrl + '/c_scale,w_' + br + '/' + fileName + ' ' + br + 'w'); 
  });
  return {
    sizes: '(max-width: 1280px) 100vw 1280px',
    srcset: brs.join(','),
    src: baseUrl + '/c_scale,w_1280/' + fileName
  }
}

function getBreackpoints(publicId) {
  var b = new HashMap();
  b.put('publicId', publicId);
  b.put('timestamp', (Date.now() / 1000).toFixed);
  b.put('type', 'upload');
  var rp = new HashMap();
  rp.put('create_derived', false);
  rp.put('bytes_step', 20000);
  rp.put('min_width', 200);
  rp.put('max_width', 1000);
  rp.put('max_images', 20);
  b.put('responsive_breakpoints', rp);
  var body = {
    timestamp: (Date.now() / 1000).toFixed(),
    public_id: publicId,
    type: 'upload',
    responsive_breakpoints: [{
      bytes_step: 20000,
      min_width: 200,
      max_width: 1000,
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

function getBaseUrlPart(url, fileName) {
  return url.replace(/v[0-9]+[\/]/, '').replace(fileName, '');
}

function getFileName(url) {
  return url.substr(url.lastIndexOf('/') + 1);
}

function buildOverlayUrlPart(overlay) {
  return '/o_' + overlay.opacity + ',c_scale,g_' + overlay.position + ',l_' +overlay.id + ',w_' + overlay.scale;
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
    viewmodel.breakpoints = getBreackpointsHard(context.content.asset_sel, context.content.overlay);
    var globalPart = getImageSettingUrlPart();
    var fileName = getFileName(val.secure_url);
    var u = getBaseUrlPart(assetUrl, fileName);
    if (context.content.overlay && context.content.overlay.enable) {
      u =+ buildOverlayUrlPart(context.content.overlay);
    }
    viewmodel.url = u + globalPart + fileName;
    viewmodel.placeholder = u + getPlaceholderImage(plType) + '/' + fileName;
  } else {
    viewmodel.url = 'https://cloudinary-res.cloudinary.com/image/upload/c_scale,fl_attachment,w_100/v1/logo/for_white_bg/cloudinary_icon_for_white_bg.png"';
  }

  model.viewmodel = viewmodel;
  return new Template('experience/components/assets/media_library').render(model).text;

};

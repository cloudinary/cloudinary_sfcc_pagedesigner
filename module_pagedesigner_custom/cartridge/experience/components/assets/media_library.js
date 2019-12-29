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
var hash =  require('~/cartridge/experience/components/assets/sha1');




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
    else if(i === "responsive_breakpoints") {
      fieldsArray.push(i + '=' + generate_responsive_breakpoints_string(body[i]));
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
  var toSignStr = fields + currentSite.getCustomPreferenceValue('CloudinaryPageDesignerSecretKey');
  var toSign = new Bytes(toSignStr);
  var signature = Encoding.toHex(hasher.digestBytes(toSign));
  return signature;
};

function generate_responsive_breakpoints_string(breakpoints) {
    if (breakpoints == null) {
        return null;
    }
    breakpoints = breakpoints;
    if (!Array.isArray(breakpoints)) {
        breakpoints = [breakpoints];
    }
    return JSON.stringify(breakpoints);
}


/* function addSignatureToBody(body) {
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
}; */

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

function getBreackpointsObj(baseUrl, fileName, plType, breakpoints) {
  var plPart = (plType !== 'none') ? getPlaceholderImage(plType) : null;
  //var breakpoints = [1280, 768, 375];
  var brs = [];
  var placeholderBrs =[];
  breakpoints.forEach(function(br) {
    brs.push(baseUrl + '/c_scale,w_' + br + '/' + fileName + ' ' + br + 'w');
    if (plPart) {
      placeholderBrs.push(baseUrl + plPart + '/c_scale,w_' + br + '/' + fileName + ' ' + br + 'w');
    } else {
      brs.push(baseUrl + '/c_scale,w_' + br + '/' + fileName + ' ' + br + 'w');
    }
  });
  return {
    sizes: '(max-width: 1280px) 100vw 1280px',
    srcset: brs.join(','),
    plSrcset: placeholderBrs.join(','),
    src: baseUrl + '/c_scale,w_1280/' + fileName
  }
}

function getBreackpoints(publicId) {
  var body = {
    timestamp:(Date.now() / 1000).toFixed(),
    public_id:publicId,
    type:'upload',
    responsive_breakpoints: [{
      bytes_step:20000,
      max_width:1000,
      max_images:20,
      min_width:200
    }]
  }
  body.signature = addSignatureToBody(body);
  body.responsive_breakpoints = generate_responsive_breakpoints_string(body.responsive_breakpoints);
  body.api_key = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerAPIkey');
  var res = callService(body, 'image', 'explicit');
  if (res.ok) {
    var result = JSON.parse(res.message);
    return getBreackpointsFromResponse(result);
  }
  return [1280, 768, 375];
}

function getBreackpointsFromResponse(response) { 
  if (response.responsive_breakpoints && response.responsive_breakpoints.length > 0) {
    var resBreakpoints = [];
    response.responsive_breakpoints.forEach(function (br) {
      var breakpoints = br.breakpoints;
      if (breakpoints && Array.isArray(breakpoints)) {
        breakpoints.forEach(function (b) {
          resBreakpoints.push(b.width);
        })
      }
    });
    return resBreakpoints;
  }
  return [1280, 768, 375];
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
    'vectorize': '/e_vectorize/q_1',
    'pixelate': '/e_pixelate/q_1/f_auto',
    'blur': '/e_blur:2000/q_1/f_auto',
    'solid': '/w_iw_div_2/ar_1/c_pad/b_auto/c_crop/w_10/h_10/g_north_east/w_iw/h_ih/c_fill/f_auto/q_auto'
  }
  return placeholderImageOptions[type] || placeholderImageOptions['blur'];
}

function getBaseUrlPart(url, fileName) {
  return url.replace(/v[0-9]+[\/]/, '').replace(fileName, '').slice(0, -1);
}

function getFileName(url) {
  return url.substr(url.lastIndexOf('/') + 1);
}

function buildOverlayUrlPart(overlay) {
  return '/o_' + overlay.opacity + ',c_scale,g_' + overlay.position + ',l_' +overlay.id + ',w_' + overlay.scale + ',y_' + overlay.yOffset + ',x_' + overlay.xOffset +'/';
}
module.exports.render = function (context) {
  let model = new HashMap();
  let viewmodel = {};
  let plType = context.content.placeholderImageType;
  viewmodel.type = 'image';
  viewmodel.altText = context.content.alt || 'alt';
  let val = context.content.asset_sel;
  if (val && val.secure_url) {
    let brs = getBreackpoints(val.public_id);
    var globalPart = getImageSettingUrlPart();
    var assetUrl = getImageUrlFromAsset(val);
    var fileName = getFileName(val.secure_url);
    var baseUrl = getBaseUrlPart(assetUrl, fileName);
    if (context.content.overlay && context.content.overlay.enable) {
      baseUrl += buildOverlayUrlPart(context.content.overlay);
    } else {
      baseUrl += '/';
    }
    baseUrl += globalPart;
    viewmodel.breakpoints = getBreackpointsObj(baseUrl, fileName, plType, brs);
    viewmodel.placeholder = (plType !== 'none') ? baseUrl + getPlaceholderImage(plType) + '/' + fileName : viewmodel.breakpoints.src;
  } else {
    viewmodel.url = 'https://cloudinary-res.cloudinary.com/image/upload/c_scale,fl_attachment,w_100/v1/logo/for_white_bg/cloudinary_icon_for_white_bg.png"';
  }

  model.viewmodel = viewmodel;
  return new Template('experience/components/assets/media_library').render(model).text;

};

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
var URLUtils = require("dw/web/URLUtils");
var URLAction = require("dw/web/URLAction");
var URLParamter = require("dw/web/URLParameter");



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

function buildLinkUrl(linkArr) {
  if (linkArr && linkArr.length > 0) {
    return new URLUtils.url(new URLAction(linkArr[0], currentSite.name), new URLParamter(linkArr[1], linkArr[2]));
  }
  return null;
}

function addSignatureToBody(body) {
  var hasher = null;
  var useSha256 = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerUseSha256') === true;
  if (useSha256) {
    hasher = new MessageDigest(MessageDigest.DIGEST_SHA_256);
  } else {
    hasher = new MessageDigest(MessageDigest.DIGEST_SHA_1);
  }
  var fieldsArray = [];
  for (var i in body) {
    if (body[i] == '' || body[i] == null) {
      delete body[i];
    }
    else if (i === "responsive_breakpoints") {
      fieldsArray.push(i + '=' + generate_responsive_breakpoints_string(body[i]));
    }
    else if (Array.isArray(body[i])) {
      fieldsArray.push(i + '=' + body[i].map(function (el) {
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

function getBreackpointsObj(baseUrl, imageOverlay, textOverlay, globalPart, fileName, plType, breakpoints) {
  var plPart = (plType !== 'none') ? getPlaceholderImage(plType) : null;
  var brs = [];
  var placeholderBrs = [];
  baseUrl += globalPart;
  breakpoints.forEach(function (br) {
    var brUrl = baseUrl + 'c_scale,w_' + br + '/';
    if (imageOverlay !== null) {
      brUrl += imageOverlay + '/';
    }
    if (textOverlay !== null) {
      brUrl += textOverlay + '/';
    }
    brs.push(encodeURI(brUrl + fileName) + ' ' + br + 'w');
    if (plPart) {
      placeholderBrs.push(encodeURI(brUrl + plPart + '/' + fileName) + ' ' + br + 'w');
    }
  });
  return {
    sizes: '(max-width: ' + breakpoints[0] + 'px) 100vw, ' + breakpoints[0] + 'px',
    srcset: brs.join(','),
    plSrcset: placeholderBrs.join(','),
    src: brs[0].split(' ' + breakpoints[0] + 'w')[0]
  }
}

function getBreackpoints(publicId) {
  var body = {
    timestamp: (Date.now() / 1000).toFixed(),
    public_id: publicId,
    type: 'upload',
    responsive_breakpoints: [{
      bytes_step: 20000,
      max_width: 1000,
      max_images: 20,
      min_width: 200
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
  var dpr = currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsDPR').getValue();
  var format = currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsFormat').getValue();
  var qulaty = currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsQuality').getValue();
  var altText = currentSite.getCustomPreferenceValue('CloudinaryImageUseAltText');
  var urlPart = '/';
  if (dpr !== null && dpr !== 'none') {
    urlPart += dpr + '/';
  }
  if (format !== null && format !== 'none') {
    urlPart += format + '/';
  }
  if (qulaty !== null && qulaty !== 'none') {
    urlPart += qulaty + '/';
  }
  return urlPart;
}

function replaceGlobalTransformations(trans) {
  var t = JSON.parse(trans);
  var global = {
    dpr: currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsDPR').getValue(),
    fetchFormat: currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsFormat').getValue(),
    quality: currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsQuality').getValue(),
    raw_transformation: currentSite.getCustomPreferenceValue('CloudinaryImageTransformations')
  };
  for (var key in global) {
    if (global[key] === 'none') {
      delete global[key];
    }
  }
  t[0] = global;
  return JSON.stringify(t);
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
module.exports.render = function (context) {
  let model = new HashMap();
  let viewmodel = {};
  let cname = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCNAME');
  if (context.content.image_sel && context.content.image_sel.imageUrl) {
    viewmodel.id = idSafeString(context.content.image_sel.public_id + randomString(12));
    viewmodel.publicId = context.content.image_sel.public_id;
    viewmodel.cloudName = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerCloudName');
    if (cname !== 'res.cloudinary.com') {
      viewmodel.cname = cname;
    }
    viewmodel.placeholder = context.content.image_sel.placeholderUrl || context.content.image_sel.imageUrl;
    viewmodel.breakpoints = context.content.image_sel.breakpoints;
    viewmodel.sizes = context.content.image_sel.sizes;
    viewmodel.src = context.content.image_sel.imageUrl;
    if (context.content.image_sel.imageLinkData) {
      viewmodel.imageLink = buildLinkUrl(JSON.parse(context.content.image_sel.imageLinkData));
    }
    viewmodel.altText = context.content.image_sel.alt;
    if (context.content.image_sel.isTransformationOverride) {
      viewmodel.transformation = context.content.image_sel.transformation;
    } else {
      viewmodel.transformation = replaceGlobalTransformations(context.content.image_sel.transformation);
    }
  }
  model.viewmodel = viewmodel;
  return new Template('experience/components/assets/media_library').render(model).text;

};

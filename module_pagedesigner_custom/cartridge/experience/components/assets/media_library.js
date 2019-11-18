'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var Site = require('dw/system/Site');
var DEFAULT_CNAME = 'res.cloudinary.com';


module.exports.render = function (context) {
  let model = new HashMap();
  model.viewmodel = {};
  return new Template('experience/components/assets/media_library').render(model).text;

};

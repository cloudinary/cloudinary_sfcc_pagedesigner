/**
 * Cloudinary Video Component
 */
'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var Site = require('dw/system/Site');

module.exports.render = function (context) {
    var model = new HashMap();
    var viewmodel = {};

    var component = context.component;
    var content = context.content;

	// Component Instance Information
    viewmodel.id = component.ID;
    viewmodel.name = component.name;
    viewmodel.type = component.typeID;

	// Cloudinary Configuration
    viewmodel.cloudname = Site.getCurrent().getCustomPreferenceValue('CloudinaryPageDesignerCloudName');
    viewmodel.cname = Site.getCurrent().getCustomPreferenceValue('CloudinaryPageDesignerCNAME') ? Site.getCurrent().getCustomPreferenceValue('CloudinaryPageDesignerCNAME') : '';


    model.viewmodel = viewmodel;

    return new Template('experience/components/assets/cloudinary_image').render(model).text;
};
/**
 * Cloudinary Video Component
 */
'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var Site = require('dw/system/Site');
var DEFAULT_CNAME = 'res.cloudinary.com';

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
    
    //Because SFCC gives back the default cname if empty.
    if (viewmodel.cname === DEFAULT_CNAME){
    	viewmodel.cname = '';
    }
   
    
    // Video Options
    viewmodel.video_id = '';
    if (typeof content.video_selection === 'object') {
    	viewmodel.video_id = content.video_selection.video_id;
	}

    // Overlay Options
    viewmodel.overlay_id = '';
    viewmodel.overlay_enable = false;
    if (typeof content.overlay_selection === 'object') {
    	viewmodel.overlay_enable = content.overlay_selection.overlay_enable;
    	if (viewmodel.overlay_enable == true) {
    		viewmodel.overlay_id = content.overlay_selection.overlay_id;
            viewmodel.overlay_opacity = content.overlay_selection.overlay_opacity != undefined ? content.overlay_selection.overlay_opacity : '100';
            viewmodel.overlay_scale = content.overlay_selection.overlay_scale != undefined ? content.overlay_selection.overlay_scale : '150';
            viewmodel.overlay_position = content.overlay_selection.overlay_position != undefined ? content.overlay_selection.overlay_position : 'center';
    	}
	}

    // Player Options
    viewmodel.controls_showcontrols = content.controls_showcontrols;
    viewmodel.controls_autoplay = content.controls_autoplay;
    viewmodel.controls_loopvideo = content.controls_loopvideo;
    viewmodel.controls_theme = content.controls_theme;
    viewmodel.controls_cropresize = content.controls_cropresize;

    // Additional Options
    viewmodel.options_instagram_ready = content.options_instagram_ready;
    viewmodel.options_captions = content.options_captions;

    model.viewmodel = viewmodel;

    return new Template('experience/components/assets/cloudinary_video').render(model).text;
};
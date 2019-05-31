'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var Site = require('dw/system/Site');
var Logger = require('dw/system/Logger');

/**
 * Render logic for the assets.headlinebanner.
 */
module.exports.render = function (context) {
    var model = new HashMap();
    var viewmodel = {};

    var component = context.component;
    var content = context.content;

    viewmodel.id = component.ID;
    viewmodel.name = component.name;
    viewmodel.type = component.typeID;

    // viewmodel.cloudname = Site.getCurrent().getCustomPreferenceValue('cloudinary_cloud_name'); // content.cloudname;
    viewmodel.cloudname = Site.getCurrent().getCustomPreferenceValue('CloudinaryCloudName');

    // Video Options
    viewmodel.video_id = '';
	// viewmodel.accessible = false;
	// viewmodel.sharpen = false;
	// viewmodel.crop = false;
    if (typeof content.video_selection === 'object') {
    	viewmodel.video_id = content.video_selection.video_id;
    	// viewmodel.accessible = content.video_selection.accessible != undefined ? content.video_selection.accessible : viewmodel.accessible;
    	// viewmodel.sharpen = content.video_selection.sharpen != undefined ? content.video_selection.sharpen : viewmodel.sharpen;
    	// viewmodel.crop = content.video_selection.crop != undefined ? content.video_selection.crop : viewmodel.crop;
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

    // Other Options
    viewmodel.options_instagram_ready = content.options_instagram_ready;
    viewmodel.options_captions = content.options_captions;

    model.viewmodel = viewmodel;

    return new Template('experience/components/assets/cloudinary_video').render(model).text;
};

/*
// var cloudName = 'df76yiogz';

https://res.cloudinary.com/<cloud name>/video/upload/<manipulation parameters>/<public ID>.<video format file extension>
https://cloudinary-naveen-res.cloudinary.com/video/upload/w_1920,h_1280,c_fill,f_auto/Mercedes_Cars_Road_Trip.mp4

https://res.cloudinary.com/df76yiogz/video/upload/samples/elephants.mp4

https://res.cloudinary.com/df76yiogz/video/upload/v1557422137/samples/sea-turtle.mp4
https://res.cloudinary.com/df76yiogz/video/upload/c_pad,h_360,w_640/fl_splice,l_samples:sea-turtle,so_0/samples/elephants.mp4

https://res.cloudinary.com/df76yiogz/image/upload/v1557422119/samples/cloudinary-icon.png

samples/elephants.mp4
samples/sea-turtle.mp4
samples/cloudinary-icon.png
*/

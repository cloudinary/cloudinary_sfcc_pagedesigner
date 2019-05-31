 'use strict';

var Resource = require('dw/web/Resource');
var HashMap = require('dw/util/HashMap');
var Site = require('dw/system/Site');
var cloudinary_api = require('~/cartridge/scripts/cloudinary/cloudinary_api');

module.exports.init = function (editor) {
	// https://api.cloudinary.com/v1_1/df76yiogz/resources/video/tags/SFCCPageDesigner
    // var jsonString = Site.getCurrent().getCustomPreferenceValue('cloudinary_video_json');
    var jsonString = JSON.stringify(cloudinary_api.getVideoJSON());

    editor.configuration.put('fileData', jsonString);
}

/*
THIS DOES NOT WORK BECAUSE THE URL WOULD NEED TO BE WHITELISTED

// https://cloudinary-naveen-res.cloudinary.com/video/list/v1556746170/SFCCPageDesigner.json
var username = '133612835811619';
var password = 'iqOgJDGOfV0FTpIRXa9Zqqt6ey';
var uri = 'https://api.cloudinary.com/v1_1/df76yiogz/resources/video';
var httpClient : HTTPClient = new HTTPClient(); // dw.net.
var httpResults;
var json;
var dropdown = [];

try {
    httpClient.setTimeout(3000);
	httpClient.open('GET', uri, username, password);
	httpClient.send();
    if (httpClient.statusCode == 200) {
        httpResults = httpClient.text;
        var json = JSON.stringify(httpResults);
        if (json.error != undefined) {
            Logger.error('Cloudinary: Request error. Error Text = {0}', json.error.message);
        } else if (json.resources != undefined) {
            if (json.resources.length) {
                Logger.error('Cloudinary: Resources', json.resources);
                for (var i=0; i<json.resources.length; i++) {
                    dropdown.push(json.resources[i]).publid_id);
                }
            } else {
                Logger.error('Cloudinary: Resources returned zero results');
            }
        }
    } else {
        Logger.error('Cloudinary: Error connecting. Status Code = {0}', httpClient.statusCode);
    }
	var xmlObj : XML = new XML();
	var xmlList : XMLList = xmlObj.children().children();
	var recommendations : LinkedHashSet = new LinkedHashSet();
	for each( var item in xmlList) {
		var productID : String = item["product-id"];
		var product = dw.catalog.ProductMgr.getProduct(productID);
		if (product != null) {
	 		recommendations.add( product );
	   	}
	}
} catch(e) {
    Logger.error('Cloudinary: Unable to connect.');
}
*/

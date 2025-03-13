var System = require('dw/system/System');
var verJson = require('*/cartridge/scripts/cloudinary/version.json');
var Site = require('dw/system/Site');
var sitePrefs = Site.getCurrent().getPreferences();

module.exports.cloudinaryPDConstants = {
    CLD_TRACKING_PARAM: '?_i=AH',
    API_TRACKING_PARAM: 'CloudinarySalesForcePageDesigner/' + verJson.version + ' (CommerceCloud ' + System.compatibilityMode + ') SFPD',
    CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER: '[cloudname]',
    CLD_CLOUDNAME: sitePrefs.getCustom().CloudinaryPageDesignerCloudName
};

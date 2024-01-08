var System = require('dw/system/System');
var verJson = require('*/cartridge/scripts/cloudinary/version.json');
const Site = require('dw/system/Site');
var sitePrefs = Site.getCurrent().getPreferences();

module.exports.cloudinaryConstants = {
    API_TRACKING_PARAM: 'CloudinarySalesForcePageDesigner/' + verJson.version + ' (CommerceCloud ' + System.compatibilityMode + ') SFPD',
    CLD_LIST_SERVICE_CLOUDNAME_PLACEHOLDER: '[cloudname]',
    CLD_CLOUDNAME: sitePrefs.getCustom().CloudinaryPageDesignerCloudName
};

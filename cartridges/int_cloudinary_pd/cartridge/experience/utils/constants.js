var System = require('dw/system/System');
var verJson = require('*/cartridge/scripts/cloudinary/version.json');
module.exports.cloudinaryConstants = {
    API_TRACKING_PARAM: 'CloudinarySalesForcePageDesigner/' + verJson.version + ' (CommerceCloud ' + System.compatibilityMode + ') SFPD'
};

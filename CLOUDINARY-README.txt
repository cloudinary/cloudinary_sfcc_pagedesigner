
IMPORT META DATA
1. In Business Manager, navigate to "Administration > Site Development > Import & Export"
2. Upload and import "metadata/system-objecttype-extensions.xml"

UPDATE BUSINESS MANAGER CARTRIDGE PATH
1. Navigate to "Administration > Sites > Manage Sites"
2. Click "Business Manager"
3. Cartridge Path should look similar to "bm_pagedesigner_custom:bm_pagedesigner:bm_custom_plugin"
4. Disable and reset Cache

UPDATE SITE CARTRIDGE PATH
1. Navigate to "Administration > Sites > Manage Sites"
2. Select "SiteGenesis" (or other site)
3. Cartridge Path should look similar to "plugin_pagedesigner_sfra:app_storefront_base:module_pagedesigner_custom:module_pagedesigner"
4. Disable and reset Cache

UPDATE SITE PREFERENCES
1. Navigate to "Merchant Tools > Site Preferences"
2. Select "Cloudinary"
3. Cloudinary Enable "Yes"
4. Cloudinary Cloud Name "cloudinary-naveen"
5. Cloudinary CNAME (Leave empty for now)
6. Cloudinary API Key "674576759793411"
7. Cloudinary API Secret "EHnJIvo-wHQff29eGyOA-ZJZ9hU"
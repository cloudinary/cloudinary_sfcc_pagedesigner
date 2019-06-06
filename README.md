Cloudinary
==========

Cloudinary is a cloud service that offers a solution to a web application's entire image management pipeline. 

Easily upload images and videos to the cloud.  Automatically perform smart media resizing, cropping and conversion without installing any complex software.  Collaborate with Marketing and other teams on the same physical asset that gets displayed on your website or the app, so there’s no mistakes due to copying or emailing content around.  Media is seamlessly delivered through a fast CDN, and much much more. 

Cloudinary offers plugins to integrate with popular e-Commerce platforms.  Our comprehensive APIs and administration capabilities makes it easy to extend the plugin functionality.

Cloudinary offers a cartridge for the Salesforce B2C Commerce Page Designer.  Using this cartridge and an accompanying Cloudinary account, you can add videos to your website pages with the click of a mouse.  Common operations such as changing video sizes, adding overlays, adapting to mobile devices are easily done through the cartridge using Cloudinary’s AI based media transformation capabilities.  Such videos are automatically transcoded to work on all popular browsers and mobile devices.  Cloudinary will optimize the videos to deliver the best quality with the least amount of bandwidth and time consumed, for a great user experience.   


## Setup ######################################################################

### Installing the cartridge
To install the Cloudinary page designer cartridges :

* Clone this repository 
* There are two projects representing two cartridges:  module_pagedesigner_custom and bm_pagedesigner_custom
* Import the two projects into eclipse as cartridges described in this [Salesforce documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/index.jsp?topic=%2Fcom.demandware.dochelp%2FSiteDevelopment%2FImportCartridgesIntoYourStorefront.html&cp=0_5_1_0_2)
* Verify that these two cartridges are deployed on your Commerce Cloud sandbox.


### Get your Cloudinary account information 

If you don’t have a Cloudinary account, sign up for a [free account](https://cloudinary.com/users/register/free) so you can try out image and video transformations and seamless delivery through CDN.

Get your cloudname, api_key and api_secret from your Cloudinary account [as described here](https://cloudinary.com/documentation/solution_overview#access_identifiers) 

### Configuring the cartridges

#### Import meta data

* The meta data is available in your local git project after you cloned the repo.
* In the Commerce Cloud Business Manager, navigate To "Administration > Site Development > Import & Export"
* Upload and import "metadata/system-objecttype-extensions.xml" from your local git project 
* Upload and import "metadata/services.xml" from your local git project 


#### Update business manager cartridge path

* Navigate To "Administration > Sites > Manage Sites"
* Click "Business Manager"
* Cartridge path should look similar to "bm_pagedesigner_custom:bm_pagedesigner:bm_custom_plugin"
* Disable and reset cache for the business manager site.


#### Update site cartridge path

* Navigate to "Administration > Sites > Manage Sites"
* Select "Sitegenesis" (or other site)
* Cartridge path should look similar to "plugin_pagedesigner_sfra:app_storefront_base:module_pagedesigner_custom:module_pagedesigner"
* Disable and reset cache



#### Update site preferences

* Navigate to "Merchant Tools > Site Preferences"
* Select "Cloudinary PageDesigner API"
* Cloudinary enable "Yes"
* Cloudinary cloud name.  Provide your Cloudinary cloud name from your Cloudinary account
* Cloudinary CNAME. If a special cname was setup from your Cloudinary account, provide it.
* Cloudinary Api Key.  Provide the api key from your Cloudinary account
* Cloudinary Api Secret.   Provide the api secret from your Cloudinary account

## Using the cartridge ######################################################################

### Tagging content in Cloudinary
* Login to your cloudinary account and upload some videos and images to use as overlay logos.
* Make sure you add a tag called "SFCCPageDesigner" to these videos and images.  
* * This tag is used by default, but you can use any tag you want to.  But make sure you use this tag in the custom site preferences. 
* Any assets with this tag will now be available inside the page designer interface.


## Additional resources ##########################################################

Additional resources are available at:

* [Website](https://cloudinary.com)
* [Interactive demo](https://demo.cloudinary.com/default)
* [Documentation](https://cloudinary.com/documentation)
* [Knowledge Base](https://support.cloudinary.com/hc/en-us)
* [Documentation for Ruby on Rails integration](https://cloudinary.com/documentation/rails_integration)
* [Ruby on Rails image upload documentation](https://cloudinary.com/documentation/rails_image_upload)
* [Ruby on Rails image manipulation documentation](https://cloudinary.com/documentation/rails_image_manipulation)
* [Image transformations documentation](https://cloudinary.com/documentation/image_transformations)

## Support

You can [open an issue through GitHub](https://github.com/cloudinary/cloudinary_gem/issues).

Contact us [https://cloudinary.com/contact](https://cloudinary.com/contact)

Stay tuned for updates, tips and tutorials: [Blog](https://cloudinary.com/blog), [Twitter](https://twitter.com/cloudinary), [Facebook](https://www.facebook.com/Cloudinary).

## Join the Community ##########################################################

Impact the product, hear updates, test drive new features and more! Join [here](https://www.facebook.com/groups/CloudinaryCommunity).

## License #######################################################################

Released under the MIT license. 

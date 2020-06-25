Cloudinary
==========

Cloudinary is a cloud service that offers a solution to any application's entire media management pipeline. 

Easily upload images and videos to the cloud.  Automatically perform smart media resizing, cropping and conversion without installing any complex software.  Collaborate with Marketing and other teams on the same physical asset that gets displayed on your website or the app, so there’s no mistakes due to copying or emailing content around.  Media is seamlessly delivered through a fast CDN, and much, much more. 

Cloudinary offers image and video components for the Salesforce B2C Commerce Page Designer.  Using these components and an accompanying Cloudinary account, you can add images and videos to your website pages with the click of a mouse.  Common operations such as changing image and video sizes, adding overlays, adapting to mobile devices are easily done through the cartridge using Cloudinary’s AI based media transformation capabilities.  Videos are automatically transcoded to work on all popular browsers and mobile devices, and images are automatically converted to the optimal format.  Cloudinary will optimize images and videos to deliver the best quality with the least amount of bandwidth and time consumed, for a great user experience. Our comprehensive APIs and administration capabilities makes it easy to extend the cartridge functionality.
  


## Setup ######################################################################

### Installing the Cloudinary Page Designer Cartridge 

Install the Cloudinary page designer cartridges into your Salesforce Commerce Cloud/Demandware Sandbox:

* Clone this repository. 
* There are two projects representing two cartridges: int_cloudinary_pd and bm_cloudinary_pd
* Import the two projects into eclipse as cartridges as described in this [Salesforce documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/LegacyDevDoc/ImportCartridgesIntoYourStorefront.html?cp=0_5_22_0_12).
* Verify that these two cartridges are deployed on your Commerce Cloud sandbox.


### Get your Cloudinary account information 

If you don’t have a Cloudinary account, sign up for a [free account](https://cloudinary.com/users/register/free) so you can try out image and video transformations and seamless delivery through CDN.

Get your Cloud Name, API Key and API Secret from your Cloudinary account [as described here](https://cloudinary.com/documentation/how_to_integrate_cloudinary#get_familiar_with_the_cloudinary_console).

### Configuring the cartridges

#### Import meta data

* The meta data is available in your local git project after you clone the repo.
* In the Commerce Cloud Business Manager, navigate to **Administration > Site Development > Site Import & Export**.
* Upload and import **import.zip** from the metadata folder.


#### Update the Business Manager cartridge path

* Navigate To **Administration > Sites > Manage Sites**.
* Select the **Business Manager** site.
* Add **bm_cloudinary_pd** to the cartridge path.


#### Update the site cartridge path

* Navigate to **Administration > Sites > Manage Sites**.
* Select the storefront site for which you want to enable the components and navigate to the **Settings** tab.
* Add **int_cloudinary_pad** to the cartridge path.



#### Update site preferences

* Navigate to **Merchant Tools > Site Preferences > Custom Preferences**
* Select **CloudinaryPageDesigner** and set these values and save.
  - Cloudinary Cloud Name.  Provide your Cloudinary cloud name from your Cloudinary account.
  - Cloudinary CNAME. If a special cname was setup from your Cloudinary account, provide it.
  - Cloudinary Api Key.  Provide the api key from your Cloudinary account.
  - Cloudinary Api Secret.   Provide the api secret from your Cloudinary account.
  - Any of the other optional settings, as required.

## Using the cartridge ######################################################################

### Using the Cloudinary Image and Video Components
* In the page designer, browse the availalbe components, select the Cloudinary Image or Cloudinary Video component and drag it onto the page. 
* Open up the configuration panel for the component.  
  - Choose the image or video you want to use from the embedded Cloudinary media library.
  - Select any presentation options you want to use.
  - Select image or text overlays from the Advanced Configuration options.
  - For videos, customize the video player from the Advanced Configuration options.
* Save the settings and preview the page.


## Additional resources ##########################################################

Additional resources are available at:

* [Cloudinary website](https://cloudinary.com)
* [Interactive demos](https://demo.cloudinary.com/default)
* [Documentation](https://cloudinary.com/documentation)
* [Knowledge Base](https://support.cloudinary.com/hc/en-us)
* [Video transformations documentation](https://cloudinary.com/documentation/video_manipulation_and_delivery)
* [Image transformations documentation](https://cloudinary.com/documentation/image_transformations)

## Support

You can [open an issue through GitHub](https://github.com/cloudinary/cloudinary_sfcc_pagedesigner/issues).

Contact us [https://cloudinary.com/contact](https://cloudinary.com/contact).

Stay tuned for updates, tips and tutorials: [Blog](https://cloudinary.com/blog), [Twitter](https://twitter.com/cloudinary), [Facebook](https://www.facebook.com/Cloudinary).

## Join the Community ##########################################################

Impact the product, hear updates, test drive new features and more! Join [here](https://www.facebook.com/groups/CloudinaryCommunity).

## License #######################################################################

Released under the MIT license. 

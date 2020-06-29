window.cldUtils = {
    dehydrate: function (val) {
        if (val) {
            let v = JSON.parse(JSON.stringify(val));
            if (v.formValues && v.formValues.image && v.formValues.image.asset) {
                v.formValues.image.asset = cldUtils.cleanCldAsset(v.formValues.image.asset);
            }
            if (v.formValues && v.formValues.overlayImage && v.formValues.overlayImage.asset) {
                v.formValues.overlayImage.asset = cldUtils.cleanCldAsset(v.formValues.overlayImage.asset)
            }
            if (v.formValues && v.formValues.customization) {
                delete v.formValues.customization
            }
            if (v.formValues && v.formValues.video && v.formValues.video.asset) {
                v.formValues.video.asset = cldUtils.cleanCldAsset(v.formValues.video.asset);
            }
            
            return cldUtils.cleanValue(v);
        }
        return val
    },
    cleanCldAsset: function (asset) {
        return {
            public_id: asset.public_id,
            derived: asset.derived,
            format: asset.format,
        };
    },
    cleanValue: function (value) {
        if (value) {
            for (let key in value) {
                if (key !== 'formValues' && key !== 'breakpoints') {
                    delete value[key];
                }
            }
        }
        return value;
    }
    
};
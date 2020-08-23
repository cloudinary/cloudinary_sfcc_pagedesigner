window.addEventListener('load', renderImgs);

function renderImgs() {
    let conf = {
        cloud_name: window.cloudName
    }
    if (window.cname) {
        conf.cname = window.cname
    }
    cld = cloudinary.Cloudinary.new(conf);
    for (var imageConf of cldImages) {
        if (imageConf.id) {
            var trans = JSON.parse(imageConf.transformation);
            var t = trans.map(tr => {
                if (tr.text) {
                    return buildTextOverlay(tr);
                } else if (tr.publicId) {
                    return buildImageOverlay(tr);
                }
                return tr;
            })
            var url = cld.url(imageConf.publicId, { transformation: t });
            var brs = [];
            var breakpoints = JSON.parse(imageConf.breakpoints);
            if (breakpoints && breakpoints.length > 0) {
                for (let br of breakpoints) {
                    var trs = t.concat([{ crop: 'scale', width: br }]);
                    var s = cld.url(imageConf.publicId, { transformation: trs });
                    brs.push(s + ' ' + br + 'w');
                }
            }
            var img = document.getElementById(imageConf.id);
            if (img) {
                img.src = url;
                img.onerror = onError;
                if (brs.length > 0) {
                    img.srcset = brs.join(',');
                }
            }
        }

    }
}

const onError = (err) => {
    let target = event.currentTarget;
    target.onerror = null;
    target.removeAttribute('srcset');
    target.src = 'https://product-assets-res.cloudinary.com/image/upload/w_250,co_rgb:c23834,e_colorize:100,f_png/PageDesigner/warning.png';
    return true;
}

const buildImageOverlay = (overlay) => {
    let imageOverlay = new cloudinary.Layer().publicId(overlay.publicId);
    return {
        overlay: imageOverlay,
        gravity: overlay.gravity,
        y: overlay.y,
        x: overlay.x,
        opacity: overlay.opacity,
        width: overlay.width,
        flags: 'relative'
    };
};

const buildTextOverlay = (overlay) => {
    if (overlay && overlay.text) {
        let textOverlay = new cloudinary.TextLayer()
            .fontFamily(overlay.fontFamily)
            .fontSize(overlay.fontSize)
            .fontWeight(overlay.bold ? 'bold' : 'normal')
            .fontStyle(overlay.italic ? 'italic' : 'normal')
            .textDecoration(overlay.underline ? 'underline' : 'normal')
            .textAlign(overlay.textAlign)
            .text(encodeURIComponent(overlay.text));
        return {
            overlay: textOverlay,
            gravity: overlay.gravity,
            color: overlay.color,
            y: overlay.y,
            x: overlay.x
        };
    }
};

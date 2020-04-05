window.addEventListener('load', renderImgs);

function renderImgs() {
    console.log('render images');
    cld = cloudinary.Cloudinary.new({ cloud_name: window.cloudName });
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
                    var trs = [{ crop: 'scale', width: br}].concat(t);
                    var s = cld.url(imageConf.publicId, {transformation: trs});
                    brs.push(s + ' w' + br);
                }
            }
            var img = document.getElementById(imageConf.id);
            if (img) {
                img.src = url;
                if (brs.length > 0) {
                    img.srcset = brs.join(',');
                }
            }
        }

    }
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
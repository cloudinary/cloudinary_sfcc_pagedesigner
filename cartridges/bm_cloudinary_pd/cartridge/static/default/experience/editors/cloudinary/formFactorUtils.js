/* Shared form-factor utilities for Page Designer editor widgets */
var CldFormFactorUtils = (function () {
    var FORM_FACTORS = ['mobile', 'tablet', 'desktop'];
    var TAB_ORDER    = ['desktop', 'mobile', 'tablet'];

    // --- Breakpoints ---

    function parseBreakpoints(bpStr) {
        var bp = { mobile: 767, tablet: 1023 };
        if (bpStr) {
            try {
                var parsed = JSON.parse(bpStr);
                if (typeof parsed.mobile === 'number') bp.mobile = parsed.mobile;
                if (typeof parsed.tablet === 'number') bp.tablet = parsed.tablet;
            } catch (e) {}
        }
        return bp;
    }

    function toFormFactor(viewport, bpStr) {
        if (!viewport) return 'desktop';
        if (viewport.breakpoint) {
            var vbp = viewport.breakpoint.toLowerCase();
            if (vbp === 'mobile' || vbp === 'tablet' || vbp === 'desktop') return vbp;
        }
        var bp = parseBreakpoints(bpStr);
        var w = viewport.width || 1024;
        if (w <= bp.mobile) return 'mobile';
        if (w <= bp.tablet) return 'tablet';
        return 'desktop';
    }

    // --- Asset resolution ---

    function resolveAsset(formValues, formFactor) {
        if (formValues[formFactor]) return formValues[formFactor];
        // Desktop is the primary base; mobile/tablet inherit from desktop, not each other
        return formValues['desktop'] || formValues['tablet'] || formValues['mobile'] || null;
    }

    function isInherited(formValues, formFactor) {
        return !formValues[formFactor] && !!resolveAsset(formValues, formFactor);
    }

    // --- URL builders ---

    function buildDeliveryUrl(asset, config) {
        if (!asset?.public_id) return '';
        var base = config.cname
            ? 'https://' + config.cname.replace(/^https?:\/\//, '')
            : 'https://res.cloudinary.com/' + config.cloudName;
        var ext = asset.format ? '.' + asset.format : '';
        return base + '/' + (asset.resource_type || 'image') + '/upload/' + asset.public_id + ext;
    }

    function buildThumbnailUrl(asset, config) {
        if (!asset?.public_id) return '';
        var cloudName = asset.cloudName || (config && config.cloudName) || '';
        var publicId = asset.public_id;
        if (asset.format && publicId.slice(-(asset.format.length + 1)) === '.' + asset.format) {
            publicId = publicId.slice(0, -(asset.format.length + 1));
        }
        var resourceType = asset.resource_type === 'video' ? 'video' : 'image';
        return 'https://res.cloudinary.com/' + cloudName +
            '/' + resourceType + '/upload/w_800,c_fit,q_auto,f_auto/' + publicId;
    }

    // --- HTML builders ---

    function buildTabsHTML(activeFormFactor, formValues) {
        var html = '<div class="cld-ff-tabs" role="tablist">';
        TAB_ORDER.forEach(function (ff) {
            var isActive     = ff === activeFormFactor;
            var hasSelection = !!formValues[ff];
            var label        = ff.charAt(0).toUpperCase() + ff.slice(1);
            html += '<button role="tab" type="button" ' +
                'class="cld-ff-tab' + (isActive ? ' active' : '') + '" ' +
                'data-ff="' + ff + '" ' +
                'aria-selected="' + isActive + '" ' +
                'title="' + label + (hasSelection ? ' \u2013 selection set' : ' \u2013 no selection') + '">' +
                label +
                (hasSelection ? '<span class="cld-ff-tab-dot" aria-hidden="true"></span>' : '') +
                '</button>';
        });
        html += '</div>';
        return html;
    }

    // --- Render ---

    function render(buildHTML, bindEvents) {
        var root = document.getElementById('cld-widget-root');
        if (!root) return;
        root.innerHTML = buildHTML();
        bindEvents();
    }

    return {
        FORM_FACTORS:     FORM_FACTORS,
        TAB_ORDER:        TAB_ORDER,
        parseBreakpoints: parseBreakpoints,
        toFormFactor:     toFormFactor,
        resolveAsset:     resolveAsset,
        isInherited:      isInherited,
        buildDeliveryUrl: buildDeliveryUrl,
        buildThumbnailUrl: buildThumbnailUrl,
        buildTabsHTML:    buildTabsHTML,
        render:           render
    };
}());

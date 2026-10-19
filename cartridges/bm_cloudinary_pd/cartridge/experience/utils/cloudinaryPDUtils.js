'use strict';

/**
 * Reads CloudinaryPageDesignerFormFactorBreakpoints from site preferences and
 * returns { mobile, tablet } pixel thresholds. Falls back to 767/1023.
 * @returns {{ mobile: number, tablet: number }}
 */
function parseFormFactorBreakpoints() {
    var Logger = require('dw/system/Logger');
    var currentSite = require('dw/system/Site').getCurrent();
    var breakpoints = { mobile: 767, tablet: 1023 };
    var raw = currentSite.getCustomPreferenceValue('CloudinaryPageDesignerFormFactorBreakpoints');
    if (raw) {
        try {
            var parsed = JSON.parse(raw);
            if (typeof parsed.mobile === 'number') breakpoints.mobile = parsed.mobile;
            if (typeof parsed.tablet === 'number') breakpoints.tablet = parsed.tablet;
        } catch (e) {
            Logger.getLogger('bm_cloudinary_pd', 'bm_cloudinary_pd').error('CloudinaryPageDesignerFormFactorBreakpoints is not valid JSON: {0}', e.message);
        }
    }
    return breakpoints;
}

module.exports = { parseFormFactorBreakpoints: parseFormFactorBreakpoints };

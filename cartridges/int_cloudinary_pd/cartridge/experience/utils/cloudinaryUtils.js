'use strict';
/**
 * Returns extract domain from full URL.
 * @param {string} originalPath - original path
 * @returns {string} changed path
 */
function extractTheDomain(originalPath) {
    var path = originalPath;
    if (!empty(path)) {
        path = path.match(/^(?:https?:\/\/)?([^\/]+)/);
        if (path && path.length > 0) {
            return path[1];
        }
    }
    return path;
}
module.exports = {
  extractTheDomain: extractTheDomain
}

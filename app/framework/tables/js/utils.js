/**
 * These are useful utilities used throughout the code.
 */
'use strict';
// don't warn about unused parameters, since all of these methods are stubs
/* jshint unused: vars */
/**
 * The idea of this call is that if we're on the phone, control will have been
 * set by the java framework. This script, however, should get run at the top
 * of the file no matter what. This way we're sure not to stomp on the java
 * object.
 */

/**
 * Prepends the getPlatformInfo() baseUri.
 * 
 * Removes any '\' characters from the str parameter. This is used
 * because as the json comes across the phone right now it escapes forward
 * slashes with this character. We need to remove them to get the normal
 * path.
 */
window.getUrl = function(str) {
    var cleanedStr = str.replace(/\\/g, '');
    // We can't use pub, b/c for some reason that is being overwritten
    // by the data object's pub. 
    var baseUri = JSON.parse(window.control.getPlatformInfo()).baseUri;
    var result = baseUri + '/' + cleanedStr;
    return result;
};

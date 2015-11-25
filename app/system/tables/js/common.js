//'use strict';
// don't warn about unused parameters, since all of these methods are stubs
/* jshint unused: vars */
/* global $ */

/**
 * This represents the Common object handed to the android web view in the
 * Tables code.
 *
 * It should provide all the functions available to the javascript at this
 * version of the code. It corresponds to
 * org.opendatakit.tables.view.webkits.CommonIf
 */


/**
 * Compute and return the base URI for this machine. This will allow the code
 * to function independently of the host name.
 * 
 * Returns a string representing the base uri in the format:
 * http://DOMAIN/DIRS/. Note the trailing slash.
 */
function computeBaseUri() {
  // To compute this we are going to rely on the location of the containing
  // file relative to the location we are serving as are root. If this is
  // changed, this file must be updated appropriately.
  // Since we are expecting this file to live in app/system/tables/js/, we
  // can look for the first occurrence and take everything before it.

  var expectedFileLocation = 'system/tables/js/common.js';

  var fileLocation = getCurrentFileLocation();

  var indexToFile = fileLocation.indexOf(expectedFileLocation);

  var result = fileLocation.substring(0, indexToFile);

  return result;

}


/**
 * Return the location of the currently executing file.
 */
function getCurrentFileLocation() {
  // We need to get the location of the currently
  // executing file. This is not readily exposed, and it is not as simple as
  // finding the current script tag, since callers might be loading the file
  // using RequireJS or some other loading library. We're going to instead
  // pull the file location out of a stack trace.
  var error = new Error();
  var stack = error.stack;
  
  // We expect the stack to look something like:
  // TypeError: undefined is not a function
  //     at Object.window.shim.window.shim.getPlatformInfo
  //     (http://homes.cs.washington.edu/~sudars/odk/survey-js-adaptr/app/framework/survey/js/shim.js:45:29)
  //     blah blah blah
  // So now we'll extract the file location. We'll do this by assuming that
  // the location occurs in the first parentheses.
  var openParen = stack.indexOf('(');
  var closedParen = stack.indexOf(')');

  var fileLocation = stack.substring(openParen + 1, closedParen);

  return fileLocation;
}



/**
 * The idea of this call is that if we're on the phone, common will have been
 * set by the java framework. This script, however, should get run at the top
 * of the file no matter what. This way we're sure not to stomp on the java
 * object.
 */
if (!window.common) {

    var importSynchronous = function(script) {
        // script is appName-relative -- need to prepend the appName.
        
        var path = window.location.pathname;
        if ( path[0] === '/' ) {
            path = path.substr(1);
        }
        if ( path[path.length-1] === '/' ) {
            path = path.substr(0,path.length-1);
        }
        var parts = path.split('/');
        // IMPORTANT: ajax doesn't like the explicit 
        // scheme and hostname. Drop those, and just
        // specify a URL (starting with /).
        var urlScript = '/' + parts[0] + '/' + script;
        
        // get the script body
        var jqxhr = $.ajax({
            type: 'GET',
            url: urlScript,
            dataType: 'json',
            async: false
        });
        
        // and eval it in the context of window
        with (window) {
            eval(jqxhr.responseText);
        }
    };
    
    // This will be the object specified in common.json. It is not set until
    // setBackingObject is called.
    var commonObj = null;

    /**
     * Returns true if a variable is an array.
     */
    var isArray = function(varToTest) {
        if (Object.prototype.toString.call(varToTest) === '[object Array]') {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Returns true if str is a string, else false.
     */
    var isString = function(str) {
        return (typeof str === 'string');
    };

    /**
     * This is a helper method to DRY out the type checking for the open*
     * methods that take the tableId, sqlWhereClause, sqlSelectionArgs, and
     * relativePath parameters.
     */
    var assertOpenTypes = function(fnName, tableId, where, args, path) {
        if (!isString(tableId)) {
            throw fnName + '--tableId not a string';
        }
        if (!isString(where) && where !== null && where !== undefined) {
            throw fnName + '--sqlWhereClause not a string';
        }
        if (!isArray(args) && args !== null && args !== undefined) {
            throw fnName + '--sqlSelectionArgs not an array';
        }
        if (!isString(path) && path !== null && path !== undefined) {
            throw fnName + '--relativePath not a string';
        }
    };

    // The module object.
    var pub = {};

    // Compute the base uri.
    var baseUri = computeBaseUri();

    var logLevel = 'D';

    pub.getPlatformInfo = function() {
        // 9000 b/c that's what grunt is running on. Perhaps should configure
        // this
        var platformInfo = {
            container: 'Chrome',
            version: '31.0.1650.63',
            appName: 'Tables-test',
            baseUri: baseUri,
            logLevel: logLevel
        };
        // Because the phone returns a String, we too are going to return a
        // string here.
        var result = JSON.stringify(platformInfo);
        return result;
    };

    pub.getFileAsUrl = function(relativePath) {
        // strip off backslashes
        var cleanedStr = relativePath.replace(/\\/g, '');
        var baseUri = JSON.parse(pub.getPlatformInfo()).baseUri;
        var result = baseUri + cleanedStr;
        return result;
    };

    pub.getRowFileAsUrl = function(tableId, rowId, relativePath) {
        if ( tableId === null || tableId === undefined ) {return null;}
        if ( rowId === null || rowId === undefined ) {return null;}
        if ( relativePath === null || relativePath === undefined ) {return null;}

        if ( relativePath.charAt(0) === '/' ) {
            relativePath = relativePath.substring(1);
        }
        var baseUri = JSON.parse(pub.getPlatformInfo()).baseUri;

        var result = null;
        
        if ( pub._forbiddenInstanceDirCharsPattern === null ||
             pub._forbiddenInstanceDirCharsPattern === undefined ) {
            // defer loading this until we try to use it
            importSynchronous('system/libs/XRegExp-All-3.0.0-pre-2014-12-24.js');
            pub._forbiddenInstanceDirCharsPattern = window.XRegExp('(\\p{P}|\\p{Z})', 'A');
        }

        var iDirName = XRegExp.replace(rowId, 
                        pub._forbiddenInstanceDirCharsPattern, '_', 'all');

        var prefix = 'tables/' + tableId + '/instances/' + iDirName + '/';
        if ( relativePath.length > prefix.length && relativePath.substring(0,prefix.length) === prefix ) {
            console.error('getRowFileAsUrl - detected filepath in rowpath data');
            result = baseUri + relativePath;
        } else {
            result = baseUri + prefix + relativePath;
        }
        
        return result;
    };

    pub.log = function(severity, msg) {
        var logIt = false;
        var ll = logLevel;
        switch(severity) {
        default:
        case 'S':
        case 'F':
        case 'E':
            logIt = true;
            break;
        case 'W':
            if ( ll !== 'E' ) {
                logIt = true;
            }
            break;
        case 'I':
            if ( ll !== 'E' && ll !== 'W' ) {
                logIt = true;
            }
            break;
        case 'D':
            if ( ll !== 'E' && ll !== 'W' && ll !== 'I' ) {
                logIt = true;
            }
            break;
        case 'T':
            if ( ll !== 'E' && ll !== 'W' && ll !== 'I' && ll !== 'D' ) {
                logIt = true;
            }
            break;
        }

        if ( logIt ) {
            if ( severity === 'E' || severity === 'W' ) {
                console.error(severity + '/' + msg);
            } else {
                console.log(severity + '/' + msg);
            }
        }
        console.log();
    };

    pub.getProperty = function(propertyId) {
        this.log('D','common: DO: getProperty(' + propertyId + ')');
        return 'property-of(' + propertyId + ')';
    };

    pub.getBaseUrl = function() {
        return '../system';
    };
    
    /**
     * This is the only function that is exposed to the caller that is NOT a 
     * function exposed to the android object. It is intended only for use on
     * framework testing in Chrome. This allows us to specify a different file
     * when we want to test the functionality of the common object.
     *
     * jsonObj should be a JSON object.
     */
    pub.setBackingObject = function(jsonObj) {
        commonObj = jsonObj;
    };

    // Now we also need to set the backing object we are going to use. We
    // assume it is in the output/debug directory.
//     $.ajax({
//         url: pub.getFileAsUrl('../app/output/debug/common.json'),
//         success: function(data) {
//             var commonObject = data;
//             pub.setBackingObject(commonObject);
//         },
//         async: false
//     });

    window.common = window.common || pub;

}

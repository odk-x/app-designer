/* global */
/**
 * Various functions that we might need across screens.
 */
'use strict';

var util = {};

util.facilityType = 'facility_type';
util.regionLevel2 = 'regionLevel2';
util.powerSource = 'power_source';
util.region = 'region';
util.district = 'district';
util.adminRegions = [
        {'label': 'Central', 'region':'Central', 
            'subRegions': [{'label':'Central East', 'region':'Central East'},
                           {'label':'Central West', 'region':'Central West'}]},
        {'label':'North', 'region':'North'},
        {'label':'South', 'region':'South', 
            'subRegions':[{'label':'South East', 'region':'South East'},
                          {'label':'South West', 'region':'South West'}]}
    ];


/**
 * Return the menu options for the key.  If no value
 * is passed in return all of the options.
*/
util.getMenuOptions = function(key) {
    return util.getMenuOptionsHelper(key, util.adminRegions);
}

util.getMenuOptionsHelper = function(key, menuObj) {
    var that = this;

    if (key === null || key === undefined) {
        return menuObj;
    }

    if (menuObj === null || menuObj === undefined) {
        return null;
    }

    var len = menuObj.length;
    var keyToUse = key.toUpperCase();

    for (var i = 0; i < len; i++) {
        var regKey = menuObj[i]['region'].toUpperCase();

        if (regKey === keyToUse) {
            return menuObj[i];
        }

        if (keyToUse.indexOf(regKey) !== -1) {
            if (menuObj[i].hasOwnProperty('subRegions')) {
                var subReg = that.getMenuOptionsHelper(key, menuObj[i]['subRegions'])
                if (subReg !== null) {
                    return subReg;
                }
            } 
        }
    }

    return null;
}

util.getFacilityTypesByDistrict = function(district, successCB, failureCB) {
 //function(tableId, sqlCommand, sqlBindParams, limit, offset, successCallbackFn, failureCallbackFn) {
    odkData.arbitraryQuery('health_facility', 
        'SELECT facility_type, count(*) FROM health_facility where admin_region = ? GROUP BY facility_type',
        [district],
        null, 
        null,
        successCB,
        failureCB);
}

util.getDistrictsByAdminLevel2 = function(adminLevel2, successCB, failureCB) {
    odkData.arbitraryQuery('health_facility', 
        'SELECT admin_region FROM health_facility WHERE regionLevel2 = ? GROUP BY admin_region',
        [adminLevel2],
        null, 
        null,
        successCB,
        failureCB);
}

/**
 * Get the query parameter from the url. Note that this is kind of a hacky/lazy
 * implementation that will fail if the key string appears more than once, etc.
 */
util.getQueryParameter = function(key) {
    var href = document.location.search;
    var startIndex = href.search(key);
    if (startIndex < 0) {
        console.log('requested query parameter not found: ' + key);
        return null;
    }
    // Then we want the substring beginning after "key=".
    var indexOfValue = startIndex + key.length + 1;  // 1 for '='
    // And now it's possible that we have more than a single url parameter, so
    // only take as many characters as we need. We'll stop at the first &,
    // which is what specifies more keys.
    var fromValueOnwards = href.substring(indexOfValue);
    var stopAt = fromValueOnwards.search('&');
    if (stopAt < 0) {
        return decodeURIComponent(fromValueOnwards);
    } else {
        return decodeURIComponent(fromValueOnwards.substring(0, stopAt));
    }
};

/**
 * Get a string to append to a url that will contain information the date and
 * time. The values can then be retrieved using getQueryParameter.
 */
util.getKeyToAppendToColdChainURL = function(key, value) {

    var that = this;
    var first = true;
    var result;
    var adaptProps = {};

    // Initialize the properties object
    adaptProps[key] = value;

    for (var prop in adaptProps) {
        if (adaptProps[prop] !== null && adaptProps[prop] !== undefined) {
            if (first)
            {
                result = '?' + prop + '=' + encodeURIComponent(adaptProps[prop]);
                first = false
            } else {
                result += '&' + prop + '=' + encodeURIComponent(adaptProps[prop]);
            }
        }
    }
    return result;
};

/**
 * Get a string to append to a url that will contain information the date and
 * time. The values can then be retrieved using getQueryParameter.
 */
util.getKeysToAppendToColdChainURL = function(
      facilityType,
      regionLevel2,
      powerSource) {

    var that = this;
    var first = true;
    var result;
    var adaptProps = {};

    // Initialize the properties object
    adaptProps[that.facilityType] = facilityType;
    adaptProps[that.regionLevel2] = regionLevel2;
    adaptProps[that.powerSource] = powerSource;

    for (var prop in adaptProps) {
        if (adaptProps[prop] !== null && adaptProps[prop] !== undefined) {
            if (first)
            {
                result = '?' + prop + '=' + encodeURIComponent(adaptProps[prop]);
                first = false
            } else {
                result += '&' + prop + '=' + encodeURIComponent(adaptProps[prop]);
            }
        }
    }
    return result;
};

util.genUUID = function() {
    // construct a UUID (from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript )
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = (c === 'x') ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    return id;
};

// Formats variable names for display
util.formatDisplayText = function(txt) {
    var displayText = txt
        .replace(/_/g, " ")
        .replace(/\w\S*/g, function(str){return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();});

    return displayText;
}

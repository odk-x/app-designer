/* global odkData*/
/**
 * Various functions that we might need across screens.
 */
'use strict';

var util = {};

util.facilityType = 'facility_type';
util.regionLevel2 = 'regionLevel2';
util.powerSource = 'power_source';
util.region = 'region';
util.leafRegion = 'admin_region';
util.rowId = '_id';
util.modelRowId = 'model_row_id';
util.refrigeratorId = 'refrigerator_id';
util.facilityRowId = 'facility_row_id';
util.maintenancePriority = 'maintenance_priority';
util.adminRegions = [
        {'token':'central', 'label': 'Central', 'region':'Central', 
            'subRegions': [{'token':'central_east', 'label':'Central East', 'region':'Central East'},
                           {'token':'central_west', 'label':'Central West', 'region':'Central West'}]},
        {'token':'north', 'label':'North', 'region':'North'},
        {'token':'south', 'label':'South', 'region':'South', 
            'subRegions':[{'token':'south_east', 'label':'South East', 'region':'South East'},
                          {'token':'south_west', 'label':'South West', 'region':'South West'}]}
    ];


/**
 * Return the menu options for the key.  If no value
 * is passed in return all of the options.
*/
util.getMenuOptions = function(key) {
    return util.getMenuOptionsHelper(key, util.adminRegions);
};

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
                var subReg = that.getMenuOptionsHelper(key, menuObj[i]['subRegions']);
                if (subReg !== null) {
                    return subReg;
                }
            } 
        }
    }

    return null;
};

util.getFacilityTypesByDistrict = function(district, successCB, failureCB) {
    var queryStr = 'SELECT facility_type, count(*) FROM health_facility';
    var whereStr = ' WHERE admin_region = ?'; 
    var groupByStr = ' GROUP BY facility_type';
    var queryParam = [];

    if (district !== null && district !== undefined && district.length > 0) {
        queryParam = [district];
        queryStr = queryStr + whereStr;
    }

    queryStr = queryStr + groupByStr;
    odkData.arbitraryQuery('health_facility', 
        queryStr,
        queryParam,
        null, 
        null,
        successCB,
        failureCB);
};

util.getDistrictsByAdminLevel2 = function(adminLevel2, successCB, failureCB) {
    odkData.arbitraryQuery('health_facility', 
        'SELECT admin_region FROM health_facility WHERE regionLevel2 = ? GROUP BY admin_region',
        [adminLevel2],
        null, 
        null,
        successCB,
        failureCB);
};

/**
 * Get the query parameter from the url. Note that this is kind of a hacky/lazy
 * implementation that will fail if the key string appears more than once, etc.
 */
util.getAllQueryParameters = function(key) {
    var href = document.location.search;
    var startIndex = href.search(key);
    if (startIndex < 0) {
        console.log('requested query parameter not found: ' + key);
        return null;
    }

    var uriParams = {};

    href = href.substring(1, href.length);

    var keys = href.split('&');

    for (var i = 0; i < keys.length; i++) {
        var keyStrIdx = keys[i].search('=');
        if (keyStrIdx <= 0) {
            continue;
        } else {
            var parsedKey = keys[i].substring(0, keyStrIdx);
            uriParams[parsedKey] = decodeURIComponent(keys[i].substring(keyStrIdx+1, keys[i].length));
        
        }
    }

    return uriParams;
};

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

    href = href.substring(1, href.length);

    var keys = href.split('&');

    for (var i = 0; i < keys.length; i++) {
        var keyStrIdx = keys[i].search('=');
        if (keyStrIdx <= 0) {
            continue;
        } else {
            var parsedKey = keys[i].substring(0, keyStrIdx);
            if (parsedKey === key) {
                return decodeURIComponent(keys[i].substring(keyStrIdx+1, keys[i].length));
            }
        }
    }

    return null;
};

/**
 * Get a string to append to a url that will contain information the date and
 * time. The values can then be retrieved using getQueryParameter.
 */
util.getKeyToAppendToColdChainURL = function(key, value, shouldBeFirst) {

    var first = true;
    if (shouldBeFirst !== null && shouldBeFirst !== undefined) {
        if (shouldBeFirst === false) {
            first = false;
        }
    }

    var result;
    var adaptProps = {};

    // Initialize the properties object
    adaptProps[key] = value;

    for (var prop in adaptProps) {
        if (adaptProps[prop] !== null && adaptProps[prop] !== undefined) {
            if (first)
            {
                result = '?' + prop + '=' + encodeURIComponent(adaptProps[prop]);
                first = false;
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
      adminRegion,
      powerSource) {

    var that = this;
    var first = true;
    var result;
    var adaptProps = {};

    // Initialize the properties object
    if (facilityType !== null && facilityType !== undefined && facilityType.length !== 0) {
        adaptProps[that.facilityType] = facilityType;
    }

    if (regionLevel2 !== null && regionLevel2 !== undefined && regionLevel2.length !== 0) {
        adaptProps[that.regionLevel2] = regionLevel2;
    }

    if (adminRegion !== null && adminRegion !== undefined && adminRegion.length !== 0) {
        adaptProps[that.leafRegion] = adminRegion;
    }

    if (powerSource !== null && powerSource !== undefined && powerSource.length !== 0) {
        adaptProps[that.powerSource] = powerSource;
    }

    for (var prop in adaptProps) {
        if (adaptProps[prop] !== null && adaptProps[prop] !== undefined) {
            if (first)
            {
                result = '?' + prop + '=' + encodeURIComponent(adaptProps[prop]);
                first = false;
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
    if (txt === null || txt === undefined || txt.length === 0) {
        return null;
    }

    // In case we have a number
    txt = '' + txt;
    var displayText = txt
        .replace(/_/g, ' ')
        .replace(/\w\S*/g, function(str){return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();});

    return displayText;
};

util.formatDate = function(txt) {
    if (txt === null || txt === undefined || txt.length === 0) {
        return null;
    } 

    var dateToUse = txt.indexOf('T') > 0 ? txt.substring(0, txt.indexOf('T')) : txt;
    return dateToUse;
};

util.formatColIdForDisplay = function(colId, index, resultSet, applyFormat) {
    if (colId === null || colId === undefined ||
        colId.length === 0) {
        return;
    }

    if (resultSet.getCount() <= 0) {
        return;
    }

    if (index < 0) {
        return;
    }

    // Format for date
    var meta = resultSet.getMetadata();
    var elementMetadata = meta.dataTableModel[colId];
    if (elementMetadata !== undefined && elementMetadata !== null && 
        elementMetadata.elementType === 'date') {
        var dateToUse = resultSet.getData(index, colId);
        if (dateToUse !== null && dateToUse !== undefined) {
            if (applyFormat) {
                dateToUse = util.formatDate(dateToUse);
            } 
        } 
        return dateToUse;
    }

    var textToDisplay = resultSet.getData(index, colId);
    if (textToDisplay !== null && textToDisplay !== undefined && textToDisplay.length !== 0) {
        if (applyFormat) {
           textToDisplay = util.formatDisplayText(textToDisplay);
        }
 
        return textToDisplay;     
    }
    return '';

};

util.showIdForDetail = function(idOfElement, colId, resultSet, applyFormat) {
    if (idOfElement === null || idOfElement === undefined ||
        idOfElement.length === 0) {
        return;
    }

    if (colId === null || colId === undefined ||
        colId.length === 0) {
        return;
    }

    if (resultSet.getCount() === 0) {
        return;
    }

    // Format for date
    var meta = resultSet.getMetadata();
    var elementMetadata = meta.dataTableModel[colId];
    if (elementMetadata.elementType === 'date') {
        var dateToUse = resultSet.get(colId);
        if (dateToUse !== null && dateToUse !== undefined) {
            if (applyFormat) {
                dateToUse = util.formatDate(dateToUse);
            } 
            $(idOfElement).text(dateToUse);
        } 
        return;
    }

    var textToDisplay = resultSet.get(colId);
    if (textToDisplay !== null && textToDisplay !== undefined && textToDisplay.length !== 0) {
        if (applyFormat) {
           textToDisplay = util.formatDisplayText(textToDisplay);
        }
 
        $(idOfElement).text(textToDisplay);     
    }

};


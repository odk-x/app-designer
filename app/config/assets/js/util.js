/* global odkData*/
/**
 * Various functions that we might need across screens.
 */
'use strict';

var util = {};

util.facilityType = 'facility_type';
util.regionLevel2 = 'regionLevel2';
util.powerSource = 'power_source';
util.regionLevel = 'regionLevel';
util.nextRegionLevelNumber = 'next_region_level_number';
util.adminRegionId = 'admin_region_id';
util.adminRegion = 'admin_region';
util.adminRegionLevel = 'admin_region_level';
util.adminRegionName = 'admin_region_name';
util.rowId = '_id';
util.modelRowId = 'model_row_id';
util.facilityRowId = 'facility_row_id';
util.maintenancePriority = 'maintenance_priority';
util.maxLevelNumber = 'max_level_number';
util.linkedAdminRegion = 'linked_admin_region';
util.firstLevelNumber = 1;
util.groupReadOnly = 'groupReadOnly';
util.groupModify = 'groupModify';
util.groupPrivileged = 'groupPrivileged';
util.hiddenDefaultAccess = 'HIDDEN';

// The maximum possible depth for a geographic hierarchy
util.maxLevelAppDepth = 5;

util.getMaxLevel = function() {
    var queryStr = 'SELECT MAX(levelNumber) FROM geographic_regions';

    return new Promise(function(resolve, reject) {
        odkData.arbitraryQuery('geographic_regions',
            queryStr,
            null,
            null,
            null,
            resolve,
            reject);
    }).then(function (result) {
        if (result !== null) {
            return result.get('MAX(levelNumber)');
        }
    }).catch(function(reason) {
       var error = 'getMaxLevel: Failed with exception ' + reason;
       console.log(error);
    });

};

util.findAdminRegionLevel = function(adminRegion) {
    var queryStr = 'SELECT MIN(levelNumber) from geographic_regions WHERE regionLevel1 = ?' +
        ' OR regionLevel2 = ? OR regionLevel3 = ? OR regionLevel4 = ? OR regionLevel5 = ?';

    var queryParam = [];
    var i;
    for (i = 0; i < util.maxLevelAppDepth; i++) {
        queryParam.push(adminRegion);
    }

    return new Promise(function(resolve, reject) {
        odkData.arbitraryQuery('geographic_regions',
            queryStr,
            queryParam,
            null,
            null,
            resolve,
            reject);
    }).then(function(result) {
        if (result !== null) {
             return result.get('levelNumber');
        }

    }).catch(function (reason) {
        var error = 'findAdminRegionLevel: Failed with exception ' + reason;
        console.log(error);
    });

};

/**
 * Return the menu options promise based on the level number and the corresponding regionLevel.
 * The user can optionally pass in regionLevels
 */
util.getNextAdminRegionsFromCurrAdminRegionPromise = function (nextLevel, currAdminRegion) {
    var regionLevelVal = util.regionLevel + nextLevel;
    var queryStr = 'SELECT * FROM geographic_regions WHERE levelNumber = ?';
    var queryParam = [nextLevel];

    var orderByStr = ' ORDER BY ' + regionLevelVal + ' ASC';

    if (currAdminRegion !== undefined && currAdminRegion !== null) {
        var prevLevel = nextLevel - 1;
        if (prevLevel > 0) {
            var prevRegionLevelVal = util.regionLevel + prevLevel;
            queryStr += ' AND ' + prevRegionLevelVal + '= ?';
            queryParam.push(currAdminRegion);
        }
    }

    queryStr += orderByStr;

    var getNextRegionPromise = new Promise(function(resolve, reject) {
        odkData.arbitraryQuery('geographic_regions',
            queryStr,
            queryParam,
            null,
            null,
            resolve,
            reject);
    });

    return getNextRegionPromise;
};




util.getMenuOptions = function (nextLevel, currAdminRegion, maxLevel) {

    var jsonRegions = [];

    return util.getNextAdminRegionsFromCurrAdminRegionPromise(nextLevel, currAdminRegion)
        .then(function (result) {
        // If there is only 1 choice, make it
            // Assuming that this only happens between no more than 2 levels
        if (result.getCount() === 1 && nextLevel < util.maxLevelAppDepth &&
            (maxLevel !== null && maxLevel !== undefined && nextLevel <= maxLevel)) {
            var nextNextLevel = parseInt(nextLevel) + 1;
            var promiseRegionLevelVal = util.regionLevel + nextLevel;
            var nextRegion = result.get(promiseRegionLevelVal);
            return util.getNextAdminRegionsFromCurrAdminRegionPromise(nextNextLevel, nextRegion).then(function (result) {
                // return jsonObjects
                jsonRegions = util.processMenuOptions(result);
                return(jsonRegions);
            });
        } else {
            // return jsonObjects
            jsonRegions = util.processMenuOptions(result);
            return(jsonRegions);
        }
    }).catch(function (reason) {
        var error = 'getMenuOptions: Failed with exception ' + reason;
        console.log(error);
    });

};

util.processMenuOptions = function(result) {
    var jsonArray = [];
    if (result === null || result === undefined) {
        return jsonArray;
    }

    for (var i = 0; i < result.getCount(); i++) {
        var jsonRegion = {};
        var cols = result.getColumns();
        for (var j = 0; j < cols.length; j++) {
            jsonRegion[cols[j]] = result.getData(i, cols[j]);
        }
        jsonArray.push(jsonRegion);
    }

    return jsonArray;
}

util.getFacilityCountByAdminRegion = function(adminRegionId) {
    return new Promise(function(resolve, reject) {
        var queryStr = 'SELECT COUNT(*) FROM health_facilities ' +
            'JOIN geographic_regions ON geographic_regions._id = health_facilities.admin_region_id ' +
            'WHERE geographic_regions._id = ?';
        var queryParam = [adminRegionId];

        odkData.arbitraryQuery('geographic_regions',
            queryStr,
            queryParam,
            null,
            null,
            resolve, reject);

    }).then(function(result) {
        if (result !== null && result.getCount() == 1) {
            return(result.get('COUNT(*)'));
        }
    }).catch(function (reason) {
        var error = 'getFacilityCountByAdminRegion: Failed with exception ' + reason;
        console.log(error);
    });

}

util.getOneFacilityRow = function() {
    return new Promise(function(resolve, reject) {
        var queryStr = 'SELECT * FROM health_facilities';

        odkData.arbitraryQuery('health_facilities',
            queryStr,
            null,
            1,
            null,
            resolve, reject);

    }).then(function(result) {
        if (result !== null) {
            return result;
        }
    }).catch(function (reason) {
        var error = 'getOneFacilityRow: Failed with exception ' + reason;
        console.log(error);
    });

}

util.getOneRefrigeratorRow = function() {
    return new Promise(function(resolve, reject) {
        var queryStr = 'SELECT * FROM refrigerators';

        odkData.arbitraryQuery('refrigerators',
            queryStr,
            null,
            1,
            null,
            resolve, reject);

    }).then(function(result) {
        if (result !== null) {
            return result;
        }
    }).catch(function (reason) {
        var error = 'getOneRefrigeratorRow: Failed with exception ' + reason;
        console.log(error);
    });

}

util.getFacilityTypesByAdminRegion = function(adminRegion, successCB, failureCB) {
    var queryStr = 'SELECT facility_type, count(*) FROM health_facilities';
    var whereStr = ' WHERE admin_region_id = ?';
    var groupByStr = ' GROUP BY facility_type';
    var queryParam = [];

    if (adminRegion !== null && adminRegion !== undefined && adminRegion.length > 0) {
        queryParam = [adminRegion];
        queryStr = queryStr + whereStr;
    }

    queryStr = queryStr + groupByStr;
    odkData.arbitraryQuery('health_facilities',
        queryStr,
        queryParam,
        null,
        null,
        successCB,
        failureCB);
};

util.addSelAndSelArgs = function(sel, selArgs, queryStr, value) {
    if (value !== noOptionSelectString && value !== undefined &&
        value !== null) {
        if (sel === null) {
            sel = queryStr;
        } else if (sel.indexOf('WHERE') === -1) {
            sel += ' WHERE ' + queryStr;
        } else {
            sel += ' AND ' + queryStr;
        }

        if (selArgs === null) {
            selArgs = [];
        }

        selArgs.push(value);
    }
    return sel;
}

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
                result = '&' + prop + '=' + encodeURIComponent(adaptProps[prop]);
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
      adminRegionLevel,
      adminRegion,
      powerSource,
      adminRegionId) {

    var that = this;
    var first = true;
    var result;
    var ccProps = {};

    // Initialize the properties object
    if (facilityType !== null && facilityType !== undefined && facilityType.length !== 0) {
        ccProps[that.facilityType] = facilityType;
    }

    if (adminRegionLevel !== null && adminRegionLevel !== undefined && adminRegionLevel.length !== 0) {
        ccProps[that.adminRegionLevel] = adminRegionLevel;
    }

    if (adminRegion !== null && adminRegion !== undefined && adminRegion.length !== 0) {
        ccProps[that.adminRegion] = adminRegion;
    }

    if (powerSource !== null && powerSource !== undefined && powerSource.length !== 0) {
        ccProps[that.powerSource] = powerSource;
    }

    if (adminRegionId !== null && adminRegionId !== undefined && adminRegionId.length !== 0) {
        ccProps[that.adminRegionId] = adminRegionId;
    }

    for (var prop in ccProps) {
        if (ccProps[prop] !== null && ccProps[prop] !== undefined) {
            if (first)
            {
                result = '?' + prop + '=' + encodeURIComponent(ccProps[prop]);
                first = false;
            } else {
                result += '&' + prop + '=' + encodeURIComponent(ccProps[prop]);
            }
        }
    }
    return result;
};

/**
 * Get a string to append to a url that will contain information the date and
 * time. The values can then be retrieved using getQueryParameter.
 */
util.getKeysToAppendToColdChainMenuURL = function(
    maxLevel,
    currAdminRegion,
    currAdminRegionId,
    nextLevel) {

    var that = this;
    var first = true;
    var result;
    var urlParams = {};

    // Initialize the properties object
    if (maxLevel !== null && maxLevel !== undefined && maxLevel.length !== 0) {
        urlParams[that.maxLevelNumber] = maxLevel;
    }

    if (nextLevel !== null && nextLevel !== undefined && nextLevel.length !== 0) {
        urlParams[that.nextRegionLevelNumber] = nextLevel;
    }

    if (currAdminRegion !== null && currAdminRegion !== undefined && currAdminRegion.length !== 0) {
        urlParams[that.adminRegion] = currAdminRegion;
    }

    if (currAdminRegionId !== null && currAdminRegionId !== undefined && currAdminRegionId.length !== 0) {
        urlParams[that.adminRegionId] = currAdminRegionId;
    }

    for (var param in urlParams) {
        if (urlParams[param] !== null && urlParams[param] !== undefined) {
            if (first)
            {
                result = '?' + param + '=' + encodeURIComponent(urlParams[param]);
                first = false;
            } else {
                result += '&' + param + '=' + encodeURIComponent(urlParams[param]);
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


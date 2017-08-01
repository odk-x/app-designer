/* global _, odkCommon */
/* exported util */
'use strict';

/**
 * Various functions that we might need across screens.
 */
var util = {};

util.dateKey = 'follow_date';
util.timeKey = 'follow_time';
util.focalChimpKey = 'focal_chimp';

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

util.verifyIntegerQueryParameterValue = function(valToTest) {

    if (valToTest !== null || valToTest !== undefined || valToTest.length > 0) {
        valToTest = parseInt(valToTest);
        if (!_.isNaN(valToTest) && _.isNumber(valToTest)) {
            return valToTest;
        }
    }
    return 0;
};

util.formatExistingTimes = function(tableData) {

    var times = [];
    for (var i = 0; i < tableData.getCount(); i++) {
        var dataPoint = tableData.getData(i, 'FA_time_start');
        // now see if we already have this value, in which case we won't add it
        if (times.indexOf(dataPoint) < 0) {
            times.push(dataPoint);
        }
    }

    return times;

};
/**
 * Get all the timepoints that exist for a given date and focal chimp.
 * These will create a key that defines a specific point during a follow.
 *
 * Returns an array of times that have been previously recorded.
 */
util.getExistingTimesForDate = function(date, focalChimpId, cbSuccess, cbFailure) {
    // So, we're just going to query for all the rows in follow_arrival
    // matching this date.

    // Our where clause is just going to be for this date.
    var whereClause =
        'FA_FOL_date = ? AND FA_FOL_B_focal_AnimID = ?';
    var selectionArgs = [date, focalChimpId];

    window.odkData.query('follow_arrival', whereClause, selectionArgs,
        null, null, null, null, null, null, true, cbSuccess, cbFailure);
};

/**
 * Get a query for all the data at the given date and time for the specified
 * focal chimp. Together this specifies a unique time point in a follow.
 */
util.getTableDataForTimePoint = function(date, time, focalChimpId, cbSuccess, cbFailure) {

    var whereClause =
        'FA_FOL_date = ? AND FA_FOL_B_focal_AnimID = ? AND FA_time_start = ?';
    var selectionArgs = [date, focalChimpId, time];

    window.odkData.query('follow_arrival', whereClause, selectionArgs,
        null, null, null, null, null, null, true, cbSuccess, cbFailure);
};

util.getFoodDataForTimePoint = function(date, time, focalChimpId, cbSuccess, cbFailure) {

    var whereClause =
        'FB_FOL_date = ? AND FB_FOL_B_AnimID = ? AND FB_begin_feed_time = ?';

    var selectionArgs = [date, focalChimpId, time];

    window.odkData.query('food_bout', whereClause, selectionArgs,
        null, null, null, null, null, null, true, cbSuccess, cbFailure);

};

util.getSpeciesDataForTimePoint = function(date, time, focalChimpId, cbSuccess, cbFailure) {

    var whereClause =
        'OS_FOL_date = ? AND OS_FOL_B_focal_AnimID = ? AND OS_time_begin = ?';

    var selectionArgs = [date, focalChimpId, time];

    window.odkData.query('other_species', whereClause, selectionArgs,
        null, null, null, null, null, null, true, cbSuccess, cbFailure);

};

/**
 * Get a string to append to a url that will contain information the date and
 * time. The values can then be retrieved using getQueryParameter.
 */
util.getKeysToAppendToURL = function(date, time, focalChimp) {
    var result =
        '?' +
        util.dateKey +
        '=' +
        encodeURIComponent(date) +
        '&' +
        util.timeKey +
        '=' +
        encodeURIComponent(time) +
        '&' +
        util.focalChimpKey +
        '=' +
        encodeURIComponent(focalChimp);
    return result;
};

util.genUUID = function() {
	return odkCommon.genUUID();
};

// Formats variable names for display
util.formatDisplayText = function(txt) {
    var displayText = txt
        .replace(/_/g, " ")
        .replace(/\w\S*/g, function(str){return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();});

    return displayText;
};

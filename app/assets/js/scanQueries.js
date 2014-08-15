/* global control */
/**
 * Various functions that we might need across screens.
 */
'use strict';

var scanQueries = {};

scanQueries.p_code = 'patientcode';
scanQueries.childid = 'childid';
scanQueries.name = 'name';
scanQueries.birthdate = 'birthdate';

scanQueries.getExistingRecordById = function(id) {
    var whereClause =
        'childid = ?';
    var selectionArgs = [id];
    
    var records = control.query(
            'scan_page1',
            whereClause,
            selectionArgs);

    return records;
};

scanQueries.getExistingRecordByPatientCode = function(patientcode, table) {
    var whereClause =
        'qr_patientcode = ?';
    var selectionArgs = [patientcode];
    
    var records = control.query(
            table,
            whereClause,
            selectionArgs);

    return records;
};

scanQueries.getExistingRecordByName = function(name) {
    var whereClause =
        'name = ?';
    var selectionArgs = [name];
    
    var records = control.query(
            'scan_page1',
            whereClause,
            selectionArgs);

    return records;
};

scanQueries.getExistingRecordByBirthDate = function(birthdate) {
    var whereClause =
        'birthdate = ?';
    var selectionArgs = [birthdate];
    
    var records = control.query(
            'scan_page1',
            whereClause,
            selectionArgs);

    return records;
};

scanQueries.getKeysToAppendToURL = function(new_code, newChildid, newName, newBirthdate) {
    var result =
        '?' +
        scanQueries.p_code +
        '=' +
        encodeURIComponent(new_code) +
        '&' +
        scanQueries.childid +
        '=' +
        encodeURIComponent(newChildid) +
        '&' +
        scanQueries.name +
        '=' +
        encodeURIComponent(newName) + 
        '&' +
        scanQueries.birthdate +
        '=' +
        encodeURIComponent(newBirthdate);
    return result;
};

scanQueries.getQueryParameter = function(key) {
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

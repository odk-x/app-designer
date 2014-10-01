/* global control */
/**
 * Various functions that we might need across screens.
 */
'use strict';

var scanQueries = {};

scanQueries.p_code = 'patient_QRcode';  // before it was patientcode
scanQueries.childid = 'Child_patient_ID';  // before it was childid
scanQueries.name = 'Child_name';  // before it was name
scanQueries.birthdate = 'Child_DOB';  // before it was birthdate

scanQueries.getExistingRecordById = function(id) {
    var whereClause =
        'Child_patient_ID = ?';  // before it was childid
    var selectionArgs = [id];
    
    var records = control.query(
            'scan_childvacc_822_pg1',
            whereClause,
            selectionArgs);

    return records;
};
scanQueries.getExistingRecordByColumnID = function(column_id) {
    var whereClause =
        null; 
    var selectionArgs = null;
    
    var records = control.query(
            'scan_childvacc_822_pg1',
            whereClause,
            selectionArgs);

    return records;
};
scanQueries.getExistingRecordByPatientCode = function(patientcode, table) {
    if (table == "scan_childvacc_822_pg1") {
        var whereClause =
            'patient_QRcode = ?';  // before it was qe_patientcode, I have changed it to patient_QRcode
    } else {
        var whereClause =
            'qr_patientcode = ?';  // before it was qe_patientcode, I have changed it to patient_QRcode
    }
    var selectionArgs = [patientcode];
    
    var records = control.query(
            table,
            whereClause,
            selectionArgs);

    return records;
};

scanQueries.getExistingRecordByName = function(name) {
    var whereClause =
        'Child_name = ?';  // before it was name
    var selectionArgs = [name];
    
    var records = control.query(
            'scan_childvacc_822_pg1',
            whereClause,
            selectionArgs);

    return records;
};

scanQueries.getExistingRecordByBirthDate = function(birthdate) {
    var whereClause =
        'Child_DOB = ?';  // before it was birthdate
    var selectionArgs = [birthdate];
    
    var records = control.query(
            'scan_childvacc_822_pg1',
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

/* global control */
/**
 * Various functions that we might need across screens.
 */
'use strict';

var hiv_scanQueries = {};

hiv_scanQueries.patientid = 'Patient_ID';  // before it was childid
hiv_scanQueries.name = 'Patient_name';  // before it was name
hiv_scanQueries.birthdate = 'Patient_DOB';  // before it was birthdate
hiv_scanQueries.month = "month";  // before it was childid
hiv_scanQueries.age = 'age';  // before it was name
hiv_scanQueries.sex = 'sex';
hiv_scanQueries.test = 'test';

hiv_scanQueries.getExistingRecordById = function(id) {
    var whereClause =
        'Patient_ID = ?';  // before it was childid
    var selectionArgs = [id];
    
    var records = control.query(
            'scan_HIV_Patient_Record',
            whereClause,
            selectionArgs);

    return records;
};
hiv_scanQueries.getExistingRecordByColumnID = function(column_id) {
    var whereClause =
        null; 
    var selectionArgs = null;
    
    var records = control.query(
            'scan_HIV_Patient_Record',
            whereClause,
            selectionArgs);

    return records;
};
hiv_scanQueries.getExistingRecordByPatientCode = function(patientcode, table) {
    if (table == 'scan_HIV_Patient_Record') {
        var whereClause =
            'Patient_ID = ?';  // before it was qe_patientcode, I have changed it to patient_QRcode
    } else {
        var whereClause =
            'patient_ID = ?';  // before it was qe_patientcode, I have changed it to patient_QRcode
    }
    var selectionArgs = [patientcode];
    
    var records = control.query(
            table,
            whereClause,
            selectionArgs);

    return records;
};

hiv_scanQueries.getExistingRecordByName = function(name) {
   
    var whereClause =
        'Patient_name = ?'; 
    var selectionArgs = [name];
    
    var records = control.query(
            'scan_HIV_Patient_Record',
            whereClause,
            selectionArgs);

    return records;
};

hiv_scanQueries.getExistingRecordByBirthDate = function(birthdate) {
    var whereClause =
        'Patient_DOB = ?';  // before it was birthdate
    var selectionArgs = [birthdate];
    
    var records = control.query(
           'scan_HIV_Patient_Record',
            whereClause,
            selectionArgs);

    return records;
};

hiv_scanQueries.getKeysToAppendToURL = function(newPatientid) {
    var result =
        '?' +
        hiv_scanQueries.patientid +
        '=' +
        encodeURIComponent(newPatientid);
    return result;
};
hiv_scanQueries.getKeyToAppendToURL = function(month, age, sex, test) {
    var result =
        '?' +
        "month" +
        '=' +
        month +
        '&' +
        "age" +
        '=' +
        age +
        '&' +
        "sex" +
        '=' +
        sex + 
        '&' +
        "test" +
        '=' +
        test;
    return result;
};
hiv_scanQueries.getQueryParameter = function(key) {
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

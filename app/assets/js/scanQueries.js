/* global control */
/**
 * Various functions that we might need across screens.
 */
'use strict';

var scanQueries = {};

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


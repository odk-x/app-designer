/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkTables, odkData, util */
'use strict';

var maintenanceLogsResultSet = {};
var refrigeratorsData = {};

function cbFrigSuccess(result) {
    refrigeratorsData = result;

    $('#tracking_id').text(refrigeratorsData.get('tracking_id'));

    $('#refrigerator_id').text(maintenanceLogsResultSet.get('refrigerator_id'));

    util.showIdForDetail('#working_status', 'working_status', refrigeratorsData);

    util.showIdForDetail('#reason_not_working', 'reason_not_working', refrigeratorsData);

    // Format the date
    var dateSer = maintenanceLogsResultSet.get('date_serviced');
    if (dateSer !== null && dateSer !== undefined) {
        dateSer = dateSer.indexOf('T') > 0 ? dateSer.substring(0, dateSer.indexOf('T')) : dateSer;
    } 
    $('#date_serviced').text(dateSer);

    util.showIdForDetail('#maint_type', 'type_of_maintenance', maintenanceLogsResultSet);

    util.showIdForDetail('#spare_parts', 'spare_parts', maintenanceLogsResultSet);

    util.showIdForDetail('#notes', 'notes', maintenanceLogsResultSet);
    
}

function cbFrigFailure(error) {
    console.log('cbFrigFailure: query for refrigerators _id failed with message: ' + error);
}

function cbSuccess(result) {
    maintenanceLogsResultSet = result;

    odkData.query('refrigerators', '_id = ?', [maintenanceLogsResultSet.get('refrigerator_id')], 
        null, null, null, null, null, null, true, cbFrigSuccess, cbFrigFailure);
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function display() {
    odkData.getViewData(cbSuccess, cbFailure);
}
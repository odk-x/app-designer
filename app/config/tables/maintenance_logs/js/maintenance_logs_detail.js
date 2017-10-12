/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkTables, odkData, util */
'use strict';

var maintenanceLogsResultSet = {};
var refrigeratorsData = {};

function cbFrigSuccess(result) {
    refrigeratorsData = result;

    util.showIdForDetail('#tracking_id', 'tracking_id', refrigeratorsData, false);
    util.showIdForDetail('#refrigerator_id', 'refrigerator_id', maintenanceLogsResultSet, false);
    util.showIdForDetail('#working_status', 'working_status', refrigeratorsData, true);
    util.showIdForDetail('#reason_not_working', 'reason_not_working', refrigeratorsData, true);
    util.showIdForDetail('#date_serviced', 'date_serviced', maintenanceLogsResultSet, true);
    util.showIdForDetail('#maint_type', 'type_of_maintenance', maintenanceLogsResultSet, true);

    var spareParts = maintenanceLogsResultSet.get('spare_parts');
    if (spareParts !== null && spareParts !== undefined) {
        $('#spare_parts').text(maintenanceLogsResultSet.get('spare_parts'));
    }

    util.showIdForDetail('#addtl_spare_parts', 'addtl_spare_parts', maintenanceLogsResultSet, true);
    util.showIdForDetail('#notes', 'notes', maintenanceLogsResultSet, false);
    
}

function onEditLog() {
    if (!$.isEmptyObject(maintenanceLogsResultSet)) {
        odkTables.editRowWithSurvey(null, maintenanceLogsResultSet.getTableId(), maintenanceLogsResultSet.getRowId(0), 'maintenance_logs', null, null);
    }
}

function cbDeleteSuccess() {
    console.log('cbDeleteSuccess: successfully deleted row');
}

function cbDeleteFailure(error) {
    console.log('cbDeleteFailure: deleteRow failed with message: ' + error);
}

function onDeleteLog() {
    if (!$.isEmptyObject(maintenanceLogsResultSet)) {

        if (confirm('Are you sure you want to delete this maintenance log?')) {

            odkData.deleteRow(
                maintenanceLogsResultSet.getTableId(),
                null,
                maintenanceLogsResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);           
        }
    }
}

function cbFrigFailure(error) {
    console.log('cbFrigFailure: query for refrigerators _id failed with message: ' + error);
}

function cbSuccess(result) {
    maintenanceLogsResultSet = result;

    var access = maintenanceLogsResultSet.get('_effective_access');
    if (access.indexOf('w') !== -1) {
        var editButton = $('#editLogBtn');
        editButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delLogBtn');
        deleteButton.removeClass('hideButton');
    }

    odkData.query('refrigerators', '_id = ?', [maintenanceLogsResultSet.get('refrigerator_id')], 
        null, null, null, null, null, null, true, cbFrigSuccess, cbFrigFailure);
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function display() {
    odkData.getViewData(cbSuccess, cbFailure);
}
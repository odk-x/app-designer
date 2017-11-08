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
    var locale = odkCommon.getPreferredLocale();
    $('#frig-hdr').text(odkCommon.localizeText(locale, "refrigerator"));
    $('#mnt-log-info').text(odkCommon.localizeText(locale, "maintenance_log_information"));
    $('#frig-id').text(odkCommon.localizeText(locale, "refrigerator_id"));
    $('#work-stat').text(odkCommon.localizeText(locale, "working_status"));
    $('#reason-not-work').text(odkCommon.localizeText(locale, "reason_not_working"));
    $('#date-srv').text(odkCommon.localizeText(locale, "date_serviced"));
    $('#type-of-mnt').text(odkCommon.localizeText(locale, "type_of_maintenance"));
    $('#sp-prt').text(odkCommon.localizeText(locale, "spare_parts"));
    $('#add-sp-prt').text(odkCommon.localizeText(locale, "additional_spare_parts"));
    $('#notes-lbl').text(odkCommon.localizeText(locale, "notes"));

    $('#edit-log').text(odkCommon.localizeText(locale, "edit_log"));
    $('#del-log').text(odkCommon.localizeText(locale, "delete_log"));

    odkData.getViewData(cbSuccess, cbFailure);
}
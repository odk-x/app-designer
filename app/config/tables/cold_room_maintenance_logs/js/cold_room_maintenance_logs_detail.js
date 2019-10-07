/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkTables, odkData, util */
'use strict';

var crMaintenanceLogsResultSet = {};
var coldRoomData = {};

function cbCRSuccess(result) {
    coldRoomData = result;

    util.showIdForDetail('#tracking_id', 'tracking_id', coldRoomData, false);
    util.showIdForDetail('#cold_room_id', 'cold_room_id', crMaintenanceLogsResultSet, false);
    util.showIdForDetail('#functional_status', 'functional_status', coldRoomData, true);
    util.showIdForDetail('#reason_not_working', 'reason_not_working', coldRoomData, true);
    util.showIdForDetail('#date_serviced', 'date_serviced', crMaintenanceLogsResultSet, true);
    util.showIdForDetail('#maint_type', 'type_of_maintenance', crMaintenanceLogsResultSet, true);

    var spareParts = crMaintenanceLogsResultSet.get('spare_parts');
    if (spareParts !== null && spareParts !== undefined) {
        $('#spare_parts').text(crMaintenanceLogsResultSet.get('spare_parts'));
    }

    util.showIdForDetail('#addtl_spare_parts', 'addtl_spare_parts', crMaintenanceLogsResultSet, true);
    util.showIdForDetail('#notes', 'notes', crMaintenanceLogsResultSet, false);

}

function onEditLog() {
    if (!$.isEmptyObject(crMaintenanceLogsResultSet)) {
        odkTables.editRowWithSurvey(null, crMaintenanceLogsResultSet.getTableId(), crMaintenanceLogsResultSet.getRowId(0),
            'cold_room_maintenance_logs', null, null);
    }
}

function cbDeleteSuccess() {
    console.log('cbDeleteSuccess: successfully deleted row');
}

function cbDeleteFailure(error) {
    console.log('cbDeleteFailure: deleteRow failed with message: ' + error);
}

function onDeleteLog() {
    if (!$.isEmptyObject(crMaintenanceLogsResultSet)) {

        if (confirm('Are you sure you want to delete this maintenance log?')) {

            odkData.deleteRow(
                crMaintenanceLogsResultSet.getTableId(),
                null,
                crMaintenanceLogsResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function cbCRFailure(error) {
    console.log('cbCRFailure: query for cold rooms _id failed with message: ' + error);
}

function cbSuccess(result) {
    crMaintenanceLogsResultSet = result;

    var access = crMaintenanceLogsResultSet.get('_effective_access');
    if (access.indexOf('w') !== -1) {
        var editButton = $('#editLogBtn');
        editButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delLogBtn');
        deleteButton.removeClass('hideButton');
    }

    odkData.query('cold_rooms', '_id = ?', [crMaintenanceLogsResultSet.get('cold_room_id')],
        null, null, null, null, null, null, true, cbCRSuccess, cbCRFailure);
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#cold-room-hdr').text(odkCommon.localizeText(locale, "cold_room"));
    $('#mnt-log-info').text(odkCommon.localizeText(locale, "maintenance_log_information"));
    $('#cold-room-id').text(odkCommon.localizeText(locale, "cold_room_id"));
    $('#work-stat').text(odkCommon.localizeText(locale, "functional_status"));
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

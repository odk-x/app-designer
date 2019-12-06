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
    util.showIdForDetail('#functional_status', 'functional_status', refrigeratorsData, true);
    util.showIdForDetail('#reason_not_working', 'reason_not_working', refrigeratorsData, true);
    util.showIdForDetail('#date_serviced', 'date_serviced', maintenanceLogsResultSet, true);
    util.showIdForDetail('#maint_type', 'type_of_maintenance', maintenanceLogsResultSet, true);

    util.showIdForDetail('#spare_parts_electrical', 'spare_parts_electrical', maintenanceLogsResultSet, true);
    util.showIdForDetail('#spare_parts_hardware', 'spare_parts_hardware', maintenanceLogsResultSet, true);
    util.showIdForDetail('#spare_parts_monitoring', 'spare_parts_monitoring', maintenanceLogsResultSet, true);
    util.showIdForDetail('#spare_parts_power', 'spare_parts_power', maintenanceLogsResultSet, true);
    util.showIdForDetail('#spare_parts_refrigeration', 'spare_parts_refrigeration', maintenanceLogsResultSet, true);
    util.showIdForDetail('#spare_parts_solar', 'spare_parts_solar', maintenanceLogsResultSet, true);

    util.showIdForDetail('#addtl_spare_parts', 'other_spare_parts', maintenanceLogsResultSet, true);
    util.showIdForDetail('#notes', 'notes', maintenanceLogsResultSet, false);

}

function showIdArrayForDetail(htmlElementId, resultSet, elementKey) {
    var elementValue = resultSet.get(elementKey)

    if (elementValue !== null && elementValue !== undefined) {
        $(htmlElementId).text(elementValue);
    }
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
    $('#work-stat').text(odkCommon.localizeText(locale, "functional_status"));
    $('#reason-not-work').text(odkCommon.localizeText(locale, "reason_not_working"));
    $('#date-srv').text(odkCommon.localizeText(locale, "date_serviced"));
    $('#type-of-mnt').text(odkCommon.localizeText(locale, "type_of_maintenance"));
    $('#add-sp-prt').text(odkCommon.localizeText(locale, "additional_spare_parts"));
    $('#notes-lbl').text(odkCommon.localizeText(locale, "notes"));

    $('#sp-prt-elec').text(odkCommon.localizeText(locale, "spare_parts_electrical"));
    $('#sp-prt-hard').text(odkCommon.localizeText(locale, "spare_parts_hardware"));
    $('#sp-prt-mon').text(odkCommon.localizeText(locale, "spare_parts_monitoring"));
    $('#sp-prt-pow').text(odkCommon.localizeText(locale, "spare_parts_power"));
    $('#sp-prt-ref').text(odkCommon.localizeText(locale, "spare_parts_refrigeration"));
    $('#sp-prt-sol').text(odkCommon.localizeText(locale, "spare_parts_solar"));

    $('#edit-log').text(odkCommon.localizeText(locale, "edit_log"));
    $('#del-log').text(odkCommon.localizeText(locale, "delete_log"));

    odkData.getViewData(cbSuccess, cbFailure);
}

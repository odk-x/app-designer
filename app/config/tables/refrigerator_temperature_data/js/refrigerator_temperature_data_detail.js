/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkTables, odkData, util */
'use strict';

var refTempDataResultSet = {};
var refrigeratorsData = {};

function cbFrigSuccess(result) {
    refrigeratorsData = result;

    util.showIdForDetail('#tracking_id', 'tracking_id', refrigeratorsData, true);
}

function onEditTempData() {
    if (!$.isEmptyObject(refTempDataResultSet)) {
        odkTables.editRowWithSurvey(null, refTempDataResultSet.getTableId(), refTempDataResultSet.getRowId(0),
            refTempDataResultSet.getTableId(), null, null);
    }
}

function cbDeleteSuccess() {
    console.log('cbDeleteSuccess: successfully deleted row');
    var locale = odkCommon.getPreferredLocale();
    var successMsg = odkCommon.localizeText(locale, 'temperature_data_deleted_successfully');
    alert(successMsg);
    odkCommon.closeWindow(-1);
}

function cbDeleteFailure(error) {
    console.log('cbDeleteFailure: deleteRow failed with message: ' + error);
    var locale = odkCommon.getPreferredLocale();
    var failMsg = odkCommon.localizeText(locale, 'deletion_failed');
    alert(failMsg);
    odkCommon.closeWindow(-1);
}

function onDeleteTempData() {
    if (!$.isEmptyObject(refTempDataResultSet)) {
        var locale = odkCommon.getPreferredLocale();
        var confirmMsg = odkCommon.localizeText(locale, 'are_you_sure_you_want_to_delete_this_temperature_data');
        if (confirm(confirmMsg)) {

            odkData.deleteRow(
                refTempDataResultSet.getTableId(),
                null,
                refTempDataResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function cbFrigFailure(error) {
    console.log('cbFrigFailure: query for refrigerators _id failed with message: ' + error);
}

function cbSuccess(result) {
    refTempDataResultSet = result;

    var access = refTempDataResultSet.get('_effective_access');
    if (access.indexOf('w') !== -1) {
        var editButton = $('#editTempDataBtn');
        editButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delTempDataBtn');
        deleteButton.removeClass('hideButton');
    }

    util.showIdForDetail('#refrigerator_id', 'refrigerator_id', refTempDataResultSet, false);
    util.showIdForDetail('#reporting_id', 'reporting_period', refTempDataResultSet, true);

    util.showIdForDetail('#number_of_high_alarms_30', 'number_of_high_alarms_30', refTempDataResultSet, true);
    util.showIdForDetail('#number_of_low_alarms_30', 'number_of_low_alarms_30', refTempDataResultSet, true);
    util.showIdForDetail('#days_temp_above_8_30', 'days_temp_above_8_30', refTempDataResultSet, true);
    util.showIdForDetail('#days_temp_below_2_30', 'days_temp_below_2_30', refTempDataResultSet, true);

    odkData.query('refrigerators', '_id = ?', [refTempDataResultSet.get('refrigerator_id')],
        null, null, null, null, null, null, true, cbFrigSuccess, cbFrigFailure);
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#frig-hdr').text(odkCommon.localizeText(locale, "refrigerator"));
    $('#ref-temp-data').text(odkCommon.localizeText(locale, "refrigerator_temperature_data"));
    $('#frig-id').text(odkCommon.localizeText(locale, "refrigerator_id"));
    $('#rep-period').text(odkCommon.localizeText(locale, "reporting_period"));

    $('#hi-alarms').text(odkCommon.localizeText(locale, "number_of_high_alarms_over_last_30_days"));
    $('#lo-alarms').text(odkCommon.localizeText(locale, "number_of_low_alarms_over_last_30_days"));
    $('#days-above-8').text(odkCommon.localizeText(locale, "days_with_temperature_above_8_last_30_days"));
    $('#days-below-2').text(odkCommon.localizeText(locale, "days_with_temperature_below_2_last_30_days"));

    $('#edit-temp-data').text(odkCommon.localizeText(locale, "edit_temperature_data"));
    $('#del-temp-data').text(odkCommon.localizeText(locale, "delete_temperature_data"));

    odkData.getViewData(cbSuccess, cbFailure);
}

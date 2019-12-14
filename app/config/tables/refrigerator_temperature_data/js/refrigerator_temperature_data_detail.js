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
}

function cbDeleteFailure(error) {
    console.log('cbDeleteFailure: deleteRow failed with message: ' + error);
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

    util.showIdForDetail('#average_temperature', 'average_temperature', refTempDataResultSet, true);

    util.showIdForDetail('#lower_alarm_status', 'lower_alarm_status', refTempDataResultSet, true);
    util.showIdForDetail('#minimum_temperature', 'minimum_temperature', refTempDataResultSet, true);
    util.showIdForDetail('#cumulative_duration_below_lower_limit', 'cumulative_duration_below_lower_limit',
        refTempDataResultSet, true);


    util.showIdForDetail('#upper_alarm_status', 'upper_alarm_status', refTempDataResultSet, true);
    util.showIdForDetail('#maximum_temperature', 'maximum_temperature', refTempDataResultSet, true);
    util.showIdForDetail('#cumulative_duration_above_upper_limit', 'cumulative_duration_above_upper_limit',
        refTempDataResultSet, true);

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

    $('#avg-temp').text(odkCommon.localizeText(locale, "average_temperature"));

    $('#low-ala-stat').text(odkCommon.localizeText(locale, "lower_alarm_status"));
    $('#min-temp').text(odkCommon.localizeText(locale, "minimum_temperature"));
    $('#cum-dur-bel-low-lim').text(odkCommon.localizeText(locale, "cumulative_duration_below_lower_limit"));

    $('#up-ala-stat').text(odkCommon.localizeText(locale, "upper_alarm_status"));
    $('#max-temp').text(odkCommon.localizeText(locale, "maximum_temperature"));
    $('#cum-dur-abo-up-lim').text(odkCommon.localizeText(locale, "cumulative_duration_above_upper_limit"));


    $('#edit-temp-data').text(odkCommon.localizeText(locale, "edit_temperature_data"));
    $('#del-temp-data').text(odkCommon.localizeText(locale, "delete_temperature_data"));

    odkData.getViewData(cbSuccess, cbFailure);
}

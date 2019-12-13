/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkTables, odkData, util */
'use strict';

var sentinelSurveyResultSet = {};
var refrigeratorsData = {};

function cbFrigSuccess(result) {
    refrigeratorsData = result;

    util.showIdForDetail('#refrigerator_id', 'refrigerator_id', sentinelSurveyResultSet, false);
    util.showIdForDetail('#reporting_id', 'reporting_period', sentinelSurveyResultSet, true);
    util.showIdForDetail('#functional', 'alarm_functional_status', sentinelSurveyResultSet, true);
    util.showIdForDetail('#voltage_stabilizer_working', 'voltage_stabilizer_working', sentinelSurveyResultSet, true);
    util.showIdForDetail('#voltage_stabilizer_replaced', 'voltage_stabilizer_replaced', sentinelSurveyResultSet, true);
    util.showIdForDetail('#warranty_claim_been_made', 'warranty_claim_been_made', sentinelSurveyResultSet, true);

}

function onEditSentinelSurvey() {
    if (!$.isEmptyObject(sentinelSurveyResultSet)) {
        odkTables.editRowWithSurvey(null, sentinelSurveyResultSet.getTableId(), sentinelSurveyResultSet.getRowId(0), 'indicators', null, null);
    }
}

function cbDeleteSuccess() {
    console.log('cbDeleteSuccess: successfully deleted row');
}

function cbDeleteFailure(error) {
    console.log('cbDeleteFailure: deleteRow failed with message: ' + error);
}

function onDeleteSentinelSurvey() {
    if (!$.isEmptyObject(sentinelSurveyResultSet)) {
        var locale = odkCommon.getPreferredLocale();
        var confirmMsg = odkCommon.localizeText(locale, 'are_you_sure_you_want_to_delete_this_sentinel_survey');
        if (confirm(confirmMsg)) {

            odkData.deleteRow(
                sentinelSurveyResultSet.getTableId(),
                null,
                sentinelSurveyResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function cbFrigFailure(error) {
    console.log('cbFrigFailure: query for refrigerators _id failed with message: ' + error);
}

function cbSuccess(result) {
    sentinelSurveyResultSet = result;

    var access = sentinelSurveyResultSet.get('_effective_access');
    if (access.indexOf('w') !== -1) {
        var editButton = $('#editSentSurveyBtn');
        editButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delSentSurveyBtn');
        deleteButton.removeClass('hideButton');
    }

    // TODO: I don't need to do this here, but if they would like the overall refrigerator status updated
    // that should be done here perhaps - leaving this as a placeholder
    odkData.query('refrigerators', '_id = ?', [sentinelSurveyResultSet.get('refrigerator_id')],
        null, null, null, null, null, null, true, cbFrigSuccess, cbFrigFailure);
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#frig-hdr').text(odkCommon.localizeText(locale, "refrigerator"));
    $('#sent-survey-info').text(odkCommon.localizeText(locale, "sentinel_survey_information"));
    $('#frig-id').text(odkCommon.localizeText(locale, "refrigerator_id"));
    $('#rep-period').text(odkCommon.localizeText(locale, "reporting_period"));
    $('#func').text(odkCommon.localizeText(locale, "functional"));
    $('#volt-stab-work').text(odkCommon.localizeText(locale, "voltage_stabilizer_working"));
    $('#volt-stab-rep').text(odkCommon.localizeText(locale, "voltage_stabilizer_replaced"));
    $('#war-claim-made').text(odkCommon.localizeText(locale, "warranty_claim_made"));

    $('#edit-sent-survey').text(odkCommon.localizeText(locale, "edit_sentinel_survey"));
    $('#del-sent-survey').text(odkCommon.localizeText(locale, "delete_sentinel_survey"));

    odkData.getViewData(cbSuccess, cbFailure);
}

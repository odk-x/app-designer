/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkTables, odkData, util */
'use strict';

var followupSurveyResultSet = {};
var failureReportingData = {};

function cbFrigSuccess(result) {
    failureReportingData = result;

    util.showIdForDetail('#followup_id', 'followup_uuid', followupSurveyResultSet, false);
    $('#followup_date').text(followupSurveyResultSet.get('followup_date').slice(0,10));
    util.showIdForDetail('#refrigerator_id', 'refrigerator_id', followupSurveyResultSet, false);
    
    var componentFailureColumn = failureReportingData.getColumnData('component_failure');
    var failureCause1Column = failureReportingData.getColumnData('failure_cause_1');
    var failureCause2Column = failureReportingData.getColumnData('failure_cause_2');

    if(componentFailureColumn.length > 0){
        document.getElementById('dynamic_layout').innerHTML += 
        '<div class="detail col-12"> <h3 id="failure-reporting">Failure Reporting</h3></div>';
    }

    for (let i = 0; i < componentFailureColumn.length; i++) {

        var component_failure = "N/A";
        var failure_cause_1 = "N/A";
        var failure_cause_2 = "N/A";    

        if(componentFailureColumn[i] != null){
            component_failure = componentFailureColumn[i];
        }

        if(failureCause1Column[i] != null){
            failure_cause_1 = failureCause1Column[i];
        }

        if(failureCause2Column[i] != null){
            failure_cause_2 = failureCause2Column[i];
        }

        document.getElementById('dynamic_layout').innerHTML +=
        '<h2 style="background:none; font-size: 20px; font-weight: bold; color: rgb(115, 147, 179);">' + "Failure Reporting " + (i+1) + ':</h2>' +
        '<p><span class="detailHdr">' + "Component failure:" + '</span> <span>' + component_failure +'</span></p>' +
        '<p><span class="detailHdr">' + "Failure cause 1:" + '</span> <span>' + failure_cause_1 +'</span></p>' +
        '<p><span class="detailHdr">' + "Failure cause 2:" + '</span> <span>' + failure_cause_2 +'</span></p>';
    }

    var tfaVisitColumn = followupSurveyResultSet.get('tfa_visit_needed');
    var repairsConcernsColumn = followupSurveyResultSet.get('repairs_concerns_technician');
    var replacementPartsColumn = followupSurveyResultSet.get('replacement_parts_needed');

    var tfaVisit = "N/A";
    var repairsConcerns = "N/A";
    var replacementParts = "N/A";    

    if(tfaVisitColumn != null){
        tfaVisit = tfaVisitColumn;
    }

    if(repairsConcernsColumn != null){
        repairsConcerns = repairsConcernsColumn;
    }

    if(replacementPartsColumn != null){
        replacementParts = replacementPartsColumn;
    }

    document.getElementById('dynamic_layout').innerHTML += 
        '<div class="detail col-12"> <h3 id="information-for-technician">Information For Technician</h3></div>' +
        '<p><span class="detailHdr">' + "TFA visit needed:" + '</span> <span>' + tfaVisit +'</span></p>' +
        '<p><span class="detailHdr">' + "Repairs attempted or concerns:" + '</span> <span>' + repairsConcerns +'</span></p>' +
        '<p><span class="detailHdr">' + "Replacement part(s) needed:" + '</span> <span>' + replacementParts +'</span></p>';

    document.getElementById('dynamic_layout').innerHTML += 
        '<div id="editFollSurveyBtn" class="button hideButton">' +
            '<h3 id="edit-followup-survey" href="#" onclick="onEditFollowupSurvey()">Edit Follow-up Survey</h3>'+
        '</div>' +

        '<div id="delFollSurveyBtn" class="button buttonDelete hideButton">' +
            '<h3 id="del-followup-survey" href="#" onclick="onDeleteFollowupSurvey()">Delete Follow-up Survey</h3>'+
        '</div>';

    var access = followupSurveyResultSet.get('_effective_access');
    if (access.indexOf('w') !== -1) {
        var editButton = $('#editFollSurveyBtn');
        editButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delFollSurveyBtn');
        deleteButton.removeClass('hideButton');
    }
}

function cbFrigFailure(error) {
    console.log('cbFrigFailure: query for refrigerators _id failed with message: ' + error);
}

function onEditFollowupSurvey() {
    if (!$.isEmptyObject(followupSurveyResultSet)) {
        odkTables.editRowWithSurvey(null, followupSurveyResultSet.getTableId(), followupSurveyResultSet.getRowId(0), 'follow_up', null, null);
    }
}

function cbDeleteSuccess() {
    console.log('cbDeleteSuccess: successfully deleted row');
    var locale = odkCommon.getPreferredLocale();
    var successMsg = odkCommon.localizeText(locale, 'followup_data_deleted_successfully');
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

function onDeleteFollowupSurvey() {
    if (!$.isEmptyObject(followupSurveyResultSet)) {
        var locale = odkCommon.getPreferredLocale();
        var confirmMsg = odkCommon.localizeText(locale, 'are_you_sure_you_want_to_delete_this_followup_survey');
        if (confirm(confirmMsg)) {

            odkData.deleteRow(
                followupSurveyResultSet.getTableId(),
                null,
                followupSurveyResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function cbSuccess(result) {
    followupSurveyResultSet = result;

    odkData.query('failure_reporting', 'followup_uuid = ?', [followupSurveyResultSet.get('followup_uuid')],
        null, null, null, null, null, null, true, cbFrigSuccess, cbFrigFailure);
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#frig-hdr').text(odkCommon.localizeText(locale, "refrigerator"));
    $('#foll-survey-info').text(odkCommon.localizeText(locale, "followup_survey_information"));
    $('#followup-id').text(odkCommon.localizeText(locale, "followup_id"));
    $('#followup-date').text(odkCommon.localizeText(locale, "followup_date"));
    $('#frig-id').text(odkCommon.localizeText(locale, "refrigerator_id"));

    odkData.getViewData(cbSuccess, cbFailure);
}

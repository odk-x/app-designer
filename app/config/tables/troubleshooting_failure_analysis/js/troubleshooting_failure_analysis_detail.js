/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkTables, odkData, util */
'use strict';

var tfaSurveyResultSet = {};
var failureReportingData = {};
var nonFailureObservationsData = {};

function processFrigPromises(failureReportingResult, nonFailureObservationsResult) {
    failureReportingData = failureReportingResult;
    nonFailureObservationsData = nonFailureObservationsResult

    util.showIdForDetail('#tfa_id', 'tfa_uuid', tfaSurveyResultSet, false);
    $('#tfa_date').text(tfaSurveyResultSet.get('tfa_date').slice(0,10));
    util.showIdForDetail('#refrigerator_id', 'refrigerator_id', tfaSurveyResultSet, false);
    
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
        '<p><span class="detailHdr">' + "Component:" + '</span> <span>' + component_failure +'</span></p>' +
        '<p><span class="detailHdr">' + "Failure cause 1:" + '</span> <span>' + failure_cause_1 +'</span></p>' +
        '<p><span class="detailHdr">' + "Failure cause 2:" + '</span> <span>' + failure_cause_2 +'</span></p>';
    }

    var componentNonFailureColumn = nonFailureObservationsData.getColumnData('component_non_failure');
    var concernColumn = nonFailureObservationsData.getColumnData('concern');
    var observationsColumn = nonFailureObservationsData.getColumnData('observations');

    if(componentNonFailureColumn.length > 0){
        document.getElementById('dynamic_layout').innerHTML += 
        '<div class="detail col-12"> <h3 id="non-failure-observations">Non Failure Observations</h3></div>';
    }

    for (let i = 0; i < componentNonFailureColumn.length; i++) {

        var component_non_failure = "N/A";
        var concern = "N/A";
        var observations = "N/A";

        if(componentNonFailureColumn[i] != null){
            component_non_failure = componentNonFailureColumn[i];
        }

        if(concernColumn[i] != null){
            concern = concernColumn[i];
        }

        if(observationsColumn[i] != null){
            observations = observationsColumn[i];
        }

        document.getElementById('dynamic_layout').innerHTML +=
        '<h2 style="background:none; font-size: 20px; font-weight: bold; color: rgb(115, 147, 179);">' + "Non Failure Observations " + (i+1) + ':</h2>' +
        '<p><span class="detailHdr">' + "Component:" + '</span> <span>' + component_non_failure +'</span></p>' +
        '<p><span class="detailHdr">' + "Concern:" + '</span> <span>' + concern +'</span></p>' +
        '<p><span class="detailHdr">' + "Additional context or obervations:" + '</span> <span>' + observations +'</span></p>';
    }

    document.getElementById('dynamic_layout').innerHTML += 
        '<div id="editTFASurveyBtn" class="button hideButton">' +
            '<h3 id="edit-tfa-survey" href="#" onclick="onEditTFASurvey()">Edit TFA Survey</h3>'+
        '</div>' +

        '<div id="delTFASurveyBtn" class="button buttonDelete hideButton">' +
            '<h3 id="del-tfa-survey" href="#" onclick="onDeleteTFASurvey()">Delete TFA Survey</h3>'+
        '</div>';

    var access = tfaSurveyResultSet.get('_effective_access');
    if (access.indexOf('w') !== -1) {
        var editButton = $('#editTFASurveyBtn');
        editButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delTFASurveyBtn');
        deleteButton.removeClass('hideButton');
    }
}

function cbFrigFailure(error) {
    console.log('cbFrigFailure: query for refrigerators _id failed with message: ' + error);
}

function onEditTFASurvey() {
    if (!$.isEmptyObject(tfaSurveyResultSet)) {
        odkTables.editRowWithSurvey(null, tfaSurveyResultSet.getTableId(), tfaSurveyResultSet.getRowId(0), 'troubleshooting_failure_analysis', null, null);
    }
}

function cbDeleteSuccess() {
    console.log('cbDeleteSuccess: successfully deleted row');
    var locale = odkCommon.getPreferredLocale();
    var successMsg = odkCommon.localizeText(locale, 'tfa_data_deleted_successfully');
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

function onDeleteTFASurvey() {
    if (!$.isEmptyObject(tfaSurveyResultSet)) {
        var locale = odkCommon.getPreferredLocale();
        var confirmMsg = odkCommon.localizeText(locale, 'are_you_sure_you_want_to_delete_this_tfa_survey');
        if (confirm(confirmMsg)) {

            odkData.deleteRow(
                tfaSurveyResultSet.getTableId(),
                null,
                tfaSurveyResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function cbSuccess(result) {
    tfaSurveyResultSet = result;

    var failureReportingPromise = new Promise(function(resolve, reject) {
        odkData.query('failure_reporting', 'tfa_uuid = ?', [tfaSurveyResultSet.get('tfa_uuid')],
        null, null, null, null, null, null, true, resolve, reject);
    });

    var nonFailureObservations = new Promise(function(resolve, reject) {
        odkData.query('non_failure_observations', 'tfa_uuid = ?', [tfaSurveyResultSet.get('tfa_uuid')],
        null, null, null, null, null, null, true, resolve, reject);
    });

    Promise.all([failureReportingPromise, nonFailureObservations]).then(function (resultArray) {
        processFrigPromises(resultArray[0], resultArray[1]);

    }, function(err) {
        console.log('promises failed with error: ' + err);
    });
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#frig-hdr').text(odkCommon.localizeText(locale, "refrigerator"));
    $('#tfa-survey-info').text(odkCommon.localizeText(locale, "tfa_survey_information"));
    $('#tfa-id').text(odkCommon.localizeText(locale, "tfa_id"));
    $('#tfa-date').text(odkCommon.localizeText(locale, "tfa_date"));
    $('#frig-id').text(odkCommon.localizeText(locale, "refrigerator_id"));

    odkData.getViewData(cbSuccess, cbFailure);
}
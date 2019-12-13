/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkTables, odkData, util */
'use strict';

var refrigeratorMovesResultSet = {};

function cbDeleteSuccess() {
    console.log('cbDeleteSuccess: successfully deleted row');
}

function cbDeleteFailure(error) {
    console.log('cbDeleteFailure: deleteRow failed with message: ' + error);
}

function onDeleteMove() {
    if (!$.isEmptyObject(refrigeratorMovesResultSet)) {

        var locale = odkCommon.getPreferredLocale();
        var confirmMsg = odkCommon.localizeText(locale, 'are_you_sure_you_want_to_delete_this_refrigerator_move');
        if (confirm(confirmMsg)) {

            odkData.deleteRow(
                refrigeratorMovesResultSet.getTableId(),
                null,
                refrigeratorMovesResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function processRefMvPromises(refResult, oldHfResult, newHfResult) {

    util.showIdForDetail('#tracking_id', 'tracking_id', refResult, false);
    util.showIdForDetail('#old_facility_id', 'facility_name', oldHfResult, false);
    util.showIdForDetail('#new_facility_id', 'facility_name', newHfResult, false);
}

function cbSuccess(result) {
    refrigeratorMovesResultSet = result;

    var access = refrigeratorMovesResultSet.get('_effective_access');

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delMvBtn');
        deleteButton.removeClass('hideButton');
    }

    util.showIdForDetail('#move_date', 'move_date', refrigeratorMovesResultSet, true);


    var refPromise = new Promise(function(resolve, reject) {
        odkData.query('refrigerators', '_id = ?', [refrigeratorMovesResultSet.get('refrigerator_id')],
            null, null, null, null, null, null, true, resolve, reject);
    });

    var oldHfPromise = new Promise(function(resolve, reject) {
        odkData.query('health_facilities', '_id = ?', [refrigeratorMovesResultSet.get('old_facility_id')],
            null, null, null, null, null, null, true, resolve, reject);
    });

    var newHfPromise = new Promise(function(resolve, reject) {
        odkData.query('health_facilities', '_id = ?', [refrigeratorMovesResultSet.get('new_facility_id')],
            null, null, null, null, null, null, true, resolve, reject);
    });


    Promise.all([refPromise, oldHfPromise, newHfPromise]).then(function (resultArray) {
        processRefMvPromises(resultArray[0], resultArray[1], resultArray[2]);

    }, function(err) {
        console.log('promises failed with error: ' + err);
    });
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#ref-mv-hdr').text(odkCommon.localizeText(locale, 'refrigerator_move'));
    $('#ref-mv-info').text(odkCommon.localizeText(locale, 'refrigerator_move_information'));

    $('#mv-frm-fac').text(odkCommon.localizeText(locale, 'moved_from_facility'));
    $('#mv-to-fac').text(odkCommon.localizeText(locale, 'moved_to_facility'));
    $('#mv-date').text(odkCommon.localizeText(locale, 'move_date'));

    $('#del-mv').text(odkCommon.localizeText(locale, 'delete_move'));

    odkData.getViewData(cbSuccess, cbFailure);
}

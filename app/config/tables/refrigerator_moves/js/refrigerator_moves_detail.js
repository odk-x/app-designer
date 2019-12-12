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

        if (confirm('Are you sure you want to delete this refrigerator move?')) {

            odkData.deleteRow(
                refrigeratorMovesResultSet.getTableId(),
                null,
                refrigeratorMovesResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

/*
function cbCRSuccess(result) {
    coldRoomData = result;

    util.showIdForDetail('#old_facility_id', 'old_facility_id', refrigeratorMovesResultSet, false);
    util.showIdForDetail('#new_facility_id', 'new_facility_id', refrigeratorMovesResultSet, false);
    util.showIdForDetail('#move_date', 'move_date', refrigeratorMovesResultSet, true);

}

function cbCRFailure(error) {
    console.log('cbCRFailure: query for cold rooms _id failed with message: ' + error);
}
*/

function cbSuccess(result) {
    refrigeratorMovesResultSet = result;

    var access = refrigeratorMovesResultSet.get('_effective_access');

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delMvBtn');
        deleteButton.removeClass('hideButton');
    }

    util.showIdForDetail('#old_facility_id', 'old_facility_id', refrigeratorMovesResultSet, false);
    util.showIdForDetail('#new_facility_id', 'new_facility_id', refrigeratorMovesResultSet, false);
    util.showIdForDetail('#move_date', 'move_date', refrigeratorMovesResultSet, true);

    // odkData.query('refrigerator_moves', '_id = ?', [refrigeratorMovesResultSet.get('cold_room_id')],
    //     null, null, null, null, null, null, true, cbCRSuccess, cbCRFailure);
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#mv-frm-fac').text('Moved from Facility');
    $('#mv-to-fac').text('Moved to Facility');
    $('#mv-date').text('Move Date');

    $('#del-log').text(odkCommon.localizeText(locale, "delete_log"));

    odkData.getViewData(cbSuccess, cbFailure);
}

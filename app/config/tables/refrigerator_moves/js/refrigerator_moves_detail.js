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
    $('#ref-mv-hdr').text(odkCommon.localizeText(locale, 'refrigerator_move'));
    $('#ref-mv-info').text(odkCommon.localizeText(locale, 'refrigerator_move_information'));

    $('#mv-frm-fac').text(odkCommon.localizeText(locale, 'moved_from_facility'));
    $('#mv-to-fac').text(odkCommon.localizeText(locale, 'moved_to_facility'));
    $('#mv-date').text(odkCommon.localizeText(locale, 'move_date'));

    $('#del-mv').text(odkCommon.localizeText(locale, 'delete_move'));

    odkData.getViewData(cbSuccess, cbFailure);
}

/**
 * This is the file that will create the list view for the table.
 */
/* global $, odkCommon, odkData, odkTables, util, listViewLogic */
'use strict';

var listQuery = 'SELECT * FROM cold_rooms ' +
    'JOIN health_facilities ON cold_rooms.facility_row_id = health_facilities._id WHERE ' +
    '(cold_rooms._sync_state != ?) AND ' +
    '(cold_rooms.maintenance_priority = ? OR cold_rooms.maintenance_priority = ? OR ' +
    'cold_rooms.maintenance_priority = ? OR cold_rooms.functional_status = ?)';

var listQueryParams = [util.deletedSyncState, 'high', 'medium', 'low', 'not_functioning'];
var searchParams = '(health_facilities.facility_name LIKE ? OR health_facilities.facility_id LIKE ? OR ' +
    'cold_rooms.tracking_id LIKE ?)';

function addMonths(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
}

function resumeFunc(state) {
    if (state === 'init') {
        // Translations
        var locale = odkCommon.getPreferredLocale();
        $('#showing').text(odkCommon.localizeText(locale, "showing"));
        $('#of').text(odkCommon.localizeText(locale, "of"));
        $('#prevButton').text(odkCommon.localizeText(locale, "previous"));
        $('#nextButton').text(odkCommon.localizeText(locale, "next"));
        $('#submit').val(odkCommon.localizeText(locale, "search"));

        // set the parameters for the list view
        listViewLogic.setTableId('cold_rooms');
        listViewLogic.setListQuery(listQuery);
        listViewLogic.setListQueryParams(listQueryParams);
        listViewLogic.setSearchParams(searchParams);
        listViewLogic.setListElement('#list');
        listViewLogic.setSearchTextElement('#search');
        listViewLogic.setHeaderElement('#header');
        listViewLogic.setLimitElement('#limitDropdown');
        listViewLogic.setPrevAndNextButtons('#prevButton', '#nextButton');
        listViewLogic.setNavTextElements('#navTextLimit', '#navTextOffset', '#navTextCnt');
        listViewLogic.showEditAndDeleteButtons(true, 'cold_rooms');

        var coldRoomTxt = odkCommon.localizeText(locale, "cold_room");
        var modelTxt = odkCommon.localizeText(locale, "model_no_colon");
        var hFacTxt = odkCommon.localizeText(locale, "facility_no_colon");

        listViewLogic.setColIdsToDisplayInList(coldRoomTxt, 'tracking_id',
            modelTxt, 'model', hFacTxt, 'facility_name');
    }

    listViewLogic.resumeFn(state);
}

function clearListResults() {
    listViewLogic.clearResults();
}

function prevListResults() {
    listViewLogic.prevResults();
}

function nextListResults() {
    listViewLogic.nextResults();
}

function getSearchListResults(){
    listViewLogic.getSearchResults();
}

function newListLimit(){
    listViewLogic.newLimit();
}

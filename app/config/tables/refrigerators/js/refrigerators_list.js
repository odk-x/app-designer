/**
 * This is the file that will create the list view for the table.
 */
/* global $, odkCommon, odkData, odkTables, util, listViewLogic */
'use strict';

var listQuery = 'SELECT * FROM refrigerators ' +
    'JOIN health_facilities ON refrigerators.facility_row_id = health_facilities._id ' +
    'LEFT JOIN refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id ' +
    'WHERE refrigerators._sync_state != ?';

var listQueryParams = [util.deletedSyncState];
var searchParams = '(facility_name LIKE ? OR facility_id LIKE ? OR tracking_id LIKE ?)';

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
        listViewLogic.setTableId('refrigerators');
        listViewLogic.setListQuery(listQuery);
        listViewLogic.setListQueryParams(listQueryParams);
        listViewLogic.setSearchParams(searchParams);
        listViewLogic.setListElement('#list');
        listViewLogic.setSearchTextElement('#search');
        listViewLogic.setHeaderElement('#header');
        listViewLogic.setLimitElement('#limitDropdown');
        listViewLogic.setPrevAndNextButtons('#prevButton', '#nextButton');
        listViewLogic.setNavTextElements('#navTextLimit', '#navTextOffset', '#navTextCnt');
        listViewLogic.showEditAndDeleteButtons(true, 'refrigerators');

        var frigTxt = odkCommon.localizeText(locale, "refrigerator");
        var catIDTxt = odkCommon.localizeText(locale, "catalog_id_no_colon");
        var hFacTxt = odkCommon.localizeText(locale, "health_facility");
        var serNoTxt = odkCommon.localizeText(locale, "serial_number");

        listViewLogic.setColIdsToDisplayInList(frigTxt, 'tracking_id',
            catIDTxt, 'catalog_id', hFacTxt, 'facility_name', );
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

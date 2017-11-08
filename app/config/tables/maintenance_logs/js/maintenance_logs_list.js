/**
 * This is the file that will create the list view for the table.
 */
/* global $, odkCommon, odkData, odkTables, util, listViewLogic */
'use strict';

var listQuery = 'SELECT * FROM maintenance_logs JOIN refrigerators ON refrigerators.refrigerator_id = maintenance_logs.refrigerator_id';

var searchParams = '(maintenance_logs.refrigerator_id LIKE ?)';

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
        listViewLogic.setTableId('maintenance_logs');
        listViewLogic.setListQuery(listQuery);
        listViewLogic.setSearchParams(searchParams);
        listViewLogic.setListElement('#list');
        listViewLogic.setSearchTextElement('#search');
        listViewLogic.setHeaderElement('#header');
        listViewLogic.setLimitElement('#limitDropdown');
        listViewLogic.setPrevAndNextButtons('#prevButton', '#nextButton');
        listViewLogic.setNavTextElements('#navTextLimit', '#navTextOffset', '#navTextCnt');
        listViewLogic.showEditAndDeleteButtons(true, 'maintenance_logs');

        var dateSrvTxt = odkCommon.localizeText(locale, "date_serviced_no_colon");
        var refIDTxt = odkCommon.localizeText(locale, "refrigerator_id_no_colon");
        var notesTxt = odkCommon.localizeText(locale, "notes_no_colon");

        listViewLogic.setColIdsToDisplayInList(dateSrvTxt, 'date_serviced', 
            refIDTxt, 'refrigerator_id', notesTxt, 'notes');
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
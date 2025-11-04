/**
 * This is the file that will create the list view for the table.
 */
/* global $, odkCommon, odkData, odkTables, util, listViewLogic */
'use strict';

var listQuery = 'SELECT * FROM refrigerators ' +
    'JOIN health_facilities ON refrigerators.facility_row_id = health_facilities._id ' +
    'LEFT JOIN refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id ' +
	'LEFT JOIN (SELECT *  FROM indicators i1  WHERE i1._id = ( SELECT i2._id FROM indicators i2 WHERE i2.refrigerator_id = i1.refrigerator_id  ORDER BY _id DESC LIMIT 1) ) latest_indicators ON refrigerators._id = latest_indicators.refrigerator_id ' +
    'WHERE refrigerators._sync_state != ?';

var listQueryParams = [util.deletedSyncState];
var searchParams = '(facility_name LIKE ? OR facility_id LIKE ? OR tracking_id LIKE ? OR is_under_pmm = ?)';

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
		listViewLogic.setSurveillanceTextElement('#surveillance');
        listViewLogic.setHeaderElement('#header1');
        listViewLogic.setLimitElement('#limitDropdown');
        listViewLogic.setPrevAndNextButtons('#prevButton', '#nextButton');
        listViewLogic.setNavTextElements('#navTextLimit', '#navTextOffset', '#navTextCnt');
        listViewLogic.showEditAndDeleteButtons(true, 'refrigerators');

        var frigTxt = odkCommon.localizeText(locale, "refrigerator");
        var catIDTxt = odkCommon.localizeText(locale, "catalog_id_no_colon");
        var hFacTxt = odkCommon.localizeText(locale, "facility_no_colon");
        var serNoTxt = odkCommon.localizeText(locale, "serial_number");

        listViewLogic.setColIdsToDisplayInList(frigTxt, 'tracking_id',
            catIDTxt, 'catalog_id', hFacTxt, 'facility_name');
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

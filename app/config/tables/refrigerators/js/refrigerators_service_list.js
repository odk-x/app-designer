/**
 * This is the file that will create the list view for the table.
 */
/* global $, odkCommon, odkData, odkTables, util, listViewLogic */
'use strict';

// TODO: A query like this would be necessary if we were going to
// get refrigerators needing service in a specific timeframe
// var listQuery = 'SELECT * FROM refrigerators ' +
//     'JOIN health_facilities ON refrigerators.facility_row_id = health_facilities._id ' +
//     'LEFT JOIN refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id ' +
//     'JOIN (SELECT _id, MAX(date_serviced) AS most_recent_date_serviced ' +
//     'FROM maintenance_logs GROUP BY _id) ' +
//     'AS recent_log ON refrigerators._id = recent_log.refrigerator_id WHERE ' +
//     '(refrigerators.maintenance_priority = ? OR refrigerators.maintenance_priority = ? OR ' +
//     'refrigerators.maintenance_priority = ?) AND most_recent_date_serviced > ?';

var listQuery = 'SELECT * FROM refrigerators ' +
    'JOIN health_facilities ON refrigerators.facility_row_id = health_facilities._id ' +
    'LEFT JOIN refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id WHERE ' +
    '(refrigerators.maintenance_priority = ? OR refrigerators.maintenance_priority = ? OR ' +
    'refrigerators.maintenance_priority = ? OR refrigerators.functional_status = ?)';

var listQueryParams = ['high', 'medium', 'low', 'not_functioning'];
var searchParams = '(health_facilities.facility_name LIKE ? OR health_facilities.facility_id LIKE ? OR ' +
    'refrigerators.tracking_id LIKE ?)';

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

        // TODO: Find out if we need data dependent query
        // If so, get the current date
        // var date6MonthsAgo = odkCommon.toOdkTimeStampFromDate(addMonths(new Date(), -6));
        // listQueryParams.push(date6MonthsAgo);

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

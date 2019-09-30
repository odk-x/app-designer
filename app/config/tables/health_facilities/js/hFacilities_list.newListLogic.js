/**
 * This is the file that will create the list view for the table.
 */
/* global $, odkCommon, odkData, odkTables, util, listViewLogic */
'use strict';

var listQuery = 'SELECT * FROM health_facilities';

var searchParams = '(facility_id LIKE ? OR facility_name LIKE ?)';

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
        listViewLogic.setTableId('health_facilities');
        listViewLogic.setListQuery(listQuery);
        listViewLogic.setListElement('#list');
        listViewLogic.showEditAndDeleteButtons(false);

        var facIDTxt = odkCommon.localizeText(locale, "facility_id");
        listViewLogic.setColIdsToDisplayInList('', 'facility_name',
            facIDTxt, 'facility_id');
    }

    listViewLogic.resumeFn(state);
}

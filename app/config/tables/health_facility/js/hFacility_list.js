/**
 * This is the file that will create the list view for the table.
 */
/* global $, odkCommon, odkData, odkTables, util, listViewLogic */
'use strict';

var listQuery = 'SELECT * FROM health_facility';

var searchParams = '(facility_id LIKE ? OR facility_name LIKE ?)';

function resumeFunc(state) {
    if (state === 'init') {
        // set the parameters for the list view
        listViewLogic.setTableId('health_facility');
        listViewLogic.setListQuery(listQuery);
        //listViewLogic.setSearchParams(searchParams);
        listViewLogic.setListElement('#list');
        //listViewLogic.setSearchTextElement('#search');
        //listViewLogic.setHeaderElement('#header');
        //listViewLogic.setLimitElement('#limitDropdown');
        //listViewLogic.setPrevAndNextButtons('#prevButton', '#nextButton');
        //listViewLogic.setNavTextElements('#navTextLimit', '#navTextOffset', '#navTextCnt');
        listViewLogic.showEditAndDeleteButtons(false);
        listViewLogic.setColIdsToDisplayInList('', 'facility_name', 
            'Facility ID', 'facility_id');
    }

    listViewLogic.resumeFn(state);
}

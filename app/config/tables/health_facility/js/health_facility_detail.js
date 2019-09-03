/**
 * The file for displaying detail views of the Health Facilities table.
 */
/* global $, odkTables, util, odkData */
'use strict';

var healthFacilityResultSet = {};

function onFacilitySummaryClick() {
    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        var rowIdQueryParams = util.getKeyToAppendToColdChainURL(util.facilityRowId, healthFacilityResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/health_facility/html/health_facility_detail_summary.html' + rowIdQueryParams);
    }
}

function onLinkClick() {

    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        var rowIdQueryParams = util.getKeyToAppendToColdChainURL(util.facilityRowId, healthFacilityResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/refrigerators/html/refrigerators_list.html' + rowIdQueryParams);
    }
}

function onAddFridgeClick() {
    var jsonMap = {};
    jsonMap.facility_row_id = healthFacilityResultSet.getRowId(0);
	jsonMap.refrigerator_id = util.genUUID();
	jsonMap._default_access = healthFacilityResultSet.get('_default_access');
	jsonMap._group_read_only = healthFacilityResultSet.get('_group_read_only');
	jsonMap._group_modify = healthFacilityResultSet.get('_group_modify');
	jsonMap._group_privileged = healthFacilityResultSet.get('_group_privileged');

    odkTables.addRowWithSurvey(null, 'refrigerators', 'refrigerators', null, jsonMap);
}

function onEditFacility() {
    if (!$.isEmptyObject(healthFacilityResultSet)) {
        odkTables.editRowWithSurvey(null, healthFacilityResultSet.getTableId(), healthFacilityResultSet.getRowId(0), 'health_facility', null, null);
    }
}

function onDeleteFacility() {
    if (!$.isEmptyObject(healthFacilityResultSet)) {
        if (confirm('Are you sure you want to delete this health facility?')) {

            odkData.deleteRow(healthFacilityResultSet.getTableId(),
                null,
                healthFacilityResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function cbDeleteSuccess() {
    console.log('health facility deleted successfully');
}

function cbDeleteFailure(error) {

    console.log('health facility delete failure CB error : ' + error);
}

function cbSuccess(result) {

    healthFacilityResultSet = result;

     var access = healthFacilityResultSet.get('_effective_access');

    if (access.indexOf('w') !== -1) {
        var editButton = $('#editFacilityBtn');
        editButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delFacilityBtn');
        deleteButton.removeClass('hideButton');
    }

    odkData.query('refrigerators', 'facility_row_id = ?', [healthFacilityResultSet.get('_id')],
        null, null, null, null, null, null, true, refrigeratorsCBSuccess, refrigeratorsCBFailure);
}

function cbFailure(error) {

    console.log('health_facility_detail getViewData CB error : ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();

    $('#refrig-inv').text(odkCommon.localizeText(locale, "refrigerator_inventory"));
    $('#add-fridge').text(odkCommon.localizeText(locale, "add_refrigerator"));
    $('#edit-fac').text(odkCommon.localizeText(locale, "edit_facility"));
    $('#del-fac').text(odkCommon.localizeText(locale, "delete_facility"));

    odkData.getViewData(cbSuccess, cbFailure);
}

function refrigeratorsCBSuccess(invData) {

    $('#TITLE').text(healthFacilityResultSet.get('facility_name'));

    $('#fridge_list').text(invData.getCount());

}

function refrigeratorsCBFailure(error) {

    console.log('health_facility_detail refrigerators query CB error : ' + error);
}

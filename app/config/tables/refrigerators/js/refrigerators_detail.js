/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkData, odkCommon, odkTables, data, util */
'use strict';

var refrigeratorsResultSet = {};
var typeData = {};
var facilityData = {};


function cbTypeSuccess(result) {

    typeData = result;

    $('#refrigerator_id').text(refrigeratorsResultSet.get('refrigerator_id'));

    $('#facility_name').text(facilityData.get('facility_name'));
    $('#model_id').text(typeData.get('catalog_id'));

    util.showIdForDetail('#tracking_id', 'tracking_id', refrigeratorsResultSet);
    util.showIdForDetail('#install_year', 'year', refrigeratorsResultSet);
    util.showIdForDetail('#working_status', 'working_status', refrigeratorsResultSet);
    util.showIdForDetail('#reason_not_working', 'reason_not_working', refrigeratorsResultSet);
    util.showIdForDetail('#voltage_regulator', 'voltage_regulator', refrigeratorsResultSet);
    util.showIdForDetail('#maintenance_priority', 'maintenance_priority', refrigeratorsResultSet);

    // Going to have to do another query for this
    //$('#date_serviced')
}

function cbTypeFailure(error) {
    console.log('cbTypeFailue: query for Type_id failed with message: ' + error);
}

function cbFacilitySuccess(result) {
    facilityData = result;
}

function cbFacilityFailure(error) {
    console.log('cbFacilityFailure: query for facility_id failed with message: ' + error);
}

function cbSuccess(result) {
    refrigeratorsResultSet = result;

    odkData.query('health_facility', '_id = ?', [refrigeratorsResultSet.get('facility_row_id')], 
        null, null, null, null, null, null, true, cbFacilitySuccess, cbFacilityFailure);

    odkData.query('refrigerator_types', '_id = ?', [refrigeratorsResultSet.get('model_row_id')],
        null, null, null, null, null, null, true, cbTypeSuccess, cbTypeFailure);
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function cbDeleteSuccess() {
    console.log('cbDeleteSuccess: successfully deleted row');
}

function cbDeleteFailure(error) {
    console.log('cbDeleteFailure: deleteRow failed with message: ' + error);
}

function display() {
    odkData.getViewData(cbSuccess, cbFailure);
}

function onLinkClickModel() {
    if (!$.isEmptyObject(typeData)) {

        odkTables.openDetailView(null, 
            'refrigerator_types',
            typeData.getRowId(0),
            'config/tables/refrigerator_types/html/refrigerator_types_detail.html');
    }
}

function onLinkClickFacility() {
    if (!$.isEmptyObject(facilityData)) {

        odkTables.openDetailView(null, 
            'health_facility',
            facilityData.getRowId(0),
            'config/tables/health_facility/html/health_facility_detail.html');
    }
}

function onLinkClickDelete() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {

        if (confirm('Are you sure you want to delete this refrigerator?')) {

            odkData.deleteRow(
                'refrigerators',
                null,
                // check getRowId parameters
                refrigeratorsResultSet.getRowId(0),
                cbDeleteSuccess,
                cbDeleteFailure);           
        }
    }
}

function onClickAddMntRec() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {

		var defaults = {'refrigerator_id': refrigeratorsResultSet.get('refrigerator_id'), 'date_serviced': odkCommon.toOdkTimeStampFromDate(new Date())};
		defaults['_default_access'] = refrigeratorsResultSet.get('_default_access');
		defaults['_group_read_only'] = refrigeratorsResultSet.get('_group_read_only');
		defaults['_group_modify'] = refrigeratorsResultSet.get('_group_modify');
		defaults['_group_privileged'] = refrigeratorsResultSet.get('_group_privileged');

        odkTables.addRowWithSurvey(null, 'maintenance_logs', 'maintenance_logs', null, defaults);          
    }
}

function onClickViewAllMntRecs() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {

        var keyToAppend = 'maintenance_logs.refrigerator_id';

        var frigIdQueryParams = util.getKeyToAppendToColdChainURL(keyToAppend, refrigeratorsResultSet.get('refrigerator_id'));
        odkTables.launchHTML(null, 
            'config/tables/maintenance_logs/html/maintenance_logs_list.html' + frigIdQueryParams);
    }
}
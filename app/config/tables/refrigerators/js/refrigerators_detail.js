/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkTables, data */
'use strict';

var refrigeratorsResultSet = {};
var typeData = {};
var facilityData = {};

function cbTypeSuccess(result) {

    typeData = result;

    $('#refrigerator_id').text(refrigeratorsResultSet.get('refrigerator_id'));

    $('#facility_name').text(facilityData.getData(0, 'facility_name'));
    $('#model_id').text(typeData.getData(0, 'catalog_id'));
    $('#tracking_id').text(refrigeratorsResultSet.get('tracking_id'));
    $('#install_year').text(refrigeratorsResultSet.get('year'));
    $('#working_status').text(util.formatDisplayText(
        refrigeratorsResultSet.get('working_status')));
    $('#reason_not_working').text(util.formatDisplayText(
        refrigeratorsResultSet.get('reason_not_working')));
    $('#voltage_regulator').text(util.formatDisplayText(
        refrigeratorsResultSet.get('voltage_regulator')));
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
        null, null, null, null, true, cbFacilitySuccess, cbFacilityFailure);

    odkData.query('refrigerator_types', '_id = ?', [refrigeratorsResultSet.get('model_row_id')],
        null, null, null, null, true, cbTypeSuccess, cbTypeFailure);
}

function cbFailure(error) {

    console.log('cbFailure: getViewData failed with message: ' + error);

}

var display = function() {

    odkData.getViewData(cbSuccess, cbFailure);

}

function onLinkClick() {

    if (!$.isEmptyObject(typeData)) {

        odkTables.openDetailView(
            'refrigerator_types',
            typeData.getRowId(0),
            'config/tables/refrigerator_types/html/refrigerator_types_detail.html');

    }

}



















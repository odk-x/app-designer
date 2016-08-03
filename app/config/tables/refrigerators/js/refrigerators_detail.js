/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkTables, data */
'use strict';

// Handle the case where we are debugging in chrome.
// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/refrigerators_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }

var refrigeratorsResultSet = {};
var typeData = {};
var facilityData = {};

function cbTypeSuccess(result) {

    typeData = result;

    $('#TITLE').text(refrigeratorsResultSet.get('refrigerator_id'));

    $('#facility_name').text(facilityData.getData(0, 'facility_name'));
    $('#model_id').text(typeData.getData(0, 'model_id'));
    $('#tracking_id').text(refrigeratorsResultSet.get('tracking_id'));
    $('#install_year').text(refrigeratorsResultSet.get('year'));
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

    odkData.query('health_facility', 'facility_id = ?', [refrigeratorsResultSet.get('facility_id')], 
        null, null, null, null, true, cbFacilitySuccess, cbFacilityFailure);

    odkData.query('refrigerator_types', 'catalog_id = ?', [refrigeratorsResultSet.get('model_id')],
        null, null, null, null, true, cbTypeSuccess, cbTypeFailure);
}

function cbFailure(error) {

    console.log('cbFailure: getViewData failed with message: ' + error);

}

var display = function() {

    odkData.getViewData(cbSuccess, cbFailure);

}


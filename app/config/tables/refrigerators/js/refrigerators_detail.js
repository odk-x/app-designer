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

function cbTypeSuccess(result) {

    typeData = result;

    $('#TITLE').text('Refrigerator: ' + refrigeratorsResultSet.get('refrigerator_id'));

    $('#FIELD_1').text(refrigeratorsResultSet.get('facility_id'));
    $('#FIELD_2').text(typeData.getData(0, 'model_id'));
    $('#FIELD_3').text(refrigeratorsResultSet.get('year_installed'));
    $('#FIELD_4').text(refrigeratorsResultSet.get('refrigerator_size'));
    $('#FIELD_5').text(util.formatDisplayText(
        refrigeratorsResultSet.get('refrigerator_condition')));
    $('#FIELD_6').text(util.formatDisplayText(
        refrigeratorsResultSet.get('power_source')));
}

function cbTypeFailure(error) {

    console.log('cbTypeFailue: query for Type_id failed with message: ' + error);

}


function cbSuccess(result) {

    refrigeratorsResultSet = result;
    
    odkData.query('refrigerator_types', 'model_id = ?', [refrigeratorsResultSet.get('model_id')],
        null, null, null, null, true, cbTypeSuccess, cbTypeFailure);
}

function cbFailure(error) {

    console.log('cbFailure: getViewData failed with message: ' + error);

}

var display = function() {

    odkData.getViewData(cbSuccess, cbFailure);

}


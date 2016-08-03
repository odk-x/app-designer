/**
 * The file for displaying the detail views of the refrigerator Types table.
 */
/* global $, odkTables, data */
'use strict';

// Handle the case where we are debugging in chrome.
// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/refrigerator_types_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }
var refrigeratorTypeResultSet = {};

function cbSuccess(result) {

    refrigeratorTypeResultSet = result;

    $('#TITLE').text(refrigeratorTypeResultSet.get('catalog_id'));
    $('#FIELD_2').text('Manufacturer: ' + refrigeratorTypeResultSet.get('manufacturer'));

}

function cbFailure(error) {
    
    console.log('cbFailure: failed with error: ' + error);

}

var display = function() {

    odkData.getViewData(cbSuccess, cbFailure);

};

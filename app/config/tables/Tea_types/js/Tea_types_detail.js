/**
 * The file for displaying the detail views of the Tea Types table.
 */
/* global $, odkTables, data */
'use strict';

// Handle the case where we are debugging in chrome.
// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/Tea_types_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }
var teaTypeResultSet = {};

function cbSuccess(result) {

    teaTypeResultSet = result;

    $('#TITLE').text(teaTypeResultSet.get('Name'));
    $('#FIELD_1').text(teaTypeResultSet.get('Type_id'));
    $('#FIELD_2').text(teaTypeResultSet.get('Origin'));

    if(teaTypeResultSet.get('Caffeinated') === 'Yes') {
        $('#FIELD_3').attr('checked', true);
    }
    $('#FIELD_3').attr('disabled', true);
    if(teaTypeResultSet.get('Fermented') === 'Yes') {
        $('#FIELD_4').attr('checked', true);
    }
    $('#FIELD_4').attr('disabled', true);

}

function cbFailure(error) {
    
    console.log('cbFailure: failed with error: ' + error);

}

var display = function() {

    odkData.getViewData(cbSuccess, cbFailure);

};

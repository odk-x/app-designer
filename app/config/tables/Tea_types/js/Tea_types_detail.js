/**
 * The file for displaying the detail views of the Tea Types table.
 */
/* global $, odkData */
'use strict';

var teaTypeResultSet = {};

function cbSuccess(result) {

    teaTypeResultSet = result;

    $('#TITLE').text(teaTypeResultSet.get('Name'));
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

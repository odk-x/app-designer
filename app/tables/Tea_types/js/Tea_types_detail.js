/**
 * The file for displaying the detail views of the Tea Types table.
 */
/* global $, control, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/Tea_types_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            window.data.setBackingObject(dataObj);
        }
    });
}

var display = function() {
    $('#TITLE').text(data.get('Name'));
    $('#FIELD_1').text(data.get('Type_id'));
    $('#FIELD_2').text(data.get('Origin'));

    if(data.get('Caffeinated') === 'Yes') {
        $('#FIELD_3').attr('checked', true);
    }
    $('#FIELD_3').attr('disabled', true);
    if(data.get('Fermented') === 'Yes') {
        $('#FIELD_4').attr('checked', true);
    }
    $('#FIELD_4').attr('disabled', true);
};

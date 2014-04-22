/**
 * The file for displaying the detail view of the tea inventory table.
 */
/* global $, control, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/Tea_inventory_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            window.data.setBackingObject(dataObj);
        }
    });
}

var display = function() {
    $('#TITLE').text(data.get('Name'));

    // We're going to get the type name from the Tea Types table.
    var typeData = control.query(
            'Tea_types',
            'Type_id = ?',
            [data.get('Type_id')]);
    $('#FIELD_1').text(typeData.getData(0, 'Name'));
    $('#FIELD_2').text(data.get('Price_8oz'));
    $('#FIELD_3').text(data.get('Price_12oz'));
    $('#FIELD_4').text(data.get('Price_16oz'));

    if(data.get('Hot') === 'Yes') {
        $('#FIELD_8').attr('checked', true);
    }
    $('#FIELD_8').attr('disabled', true);

    if(data.get('Cold') === 'Yes') {
        $('#FIELD_9').attr('checked', true);
    }
    $('#FIELD_9').attr('disabled', true);

    if(data.get('Loose_Leaf') === 'Yes') {
        $('#FIELD_11').attr('checked', true);
    }
    $('#FIELD_11').attr('disabled', true);

    if(data.get('Bags') === 'Yes') {
        $('#FIELD_12').attr('checked', true);
    }
    $('#FIELD_12').attr('disabled', true);
};

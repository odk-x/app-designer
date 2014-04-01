/**
 * The file for displaying a detail view.
 */
/* global $, control */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/plot_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: plot');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}
 
function display() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    $('#NAME').text(data.get('name'));
    $('#plot-id').text(data.get('plotId'));
    // We want to get the count.
    var table = control.query('visit', 'plotId = ?', [data.get('plotId')]);
    $('#visits').text(table.getCount());
}


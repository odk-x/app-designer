/**
 * The file for displaying a detail view.
 */
/* global $, control, data */
/*exported display */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/geopoints_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: geopoints');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}

function display() {
    var clientId = data.get('client_id');
    document.getElementById('title').innerHTML = clientId;

    // handles case when 'other' transportation mode is specified
    if(data.get('transportation_mode') !== 'Other') {
        document.getElementById('transportationMode').innerHTML =
            data.get('transportation_mode');
    } else {
        document.getElementById('transportationMode').innerHTML =
            data.get('transportation_mode_other');
    }

    // display location description and geo points
    document.getElementById('description').innerHTML = data.get('description');
    document.getElementById('coordinates').innerHTML = data.get('coordinates');
}


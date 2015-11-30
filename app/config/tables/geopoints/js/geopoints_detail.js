/**
 * The file for displaying a detail view.
 */
/* global $, odkTables, data */
/*exported display */
'use strict';

// Handle the case where we are debugging in chrome.
// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/geopoints_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             if (dataObj === undefined || dataObj === null) {
//                 console.log('Could not load data json for table: geopoints');
//             }
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }

function cbSuccess(result) {
    var clientId = result.get('client_id');
    document.getElementById('title').innerHTML = clientId;

    // handles case when 'other' transportation mode is specified
    if(result.get('transportation_mode') !== 'Other') {
        document.getElementById('transportationMode').innerHTML =
            result.get('transportation_mode');
    } else {
        document.getElementById('transportationMode').innerHTML =
            result.get('transportation_mode_other');
    }

    // display location description and geo points
    document.getElementById('description').innerHTML = result.get('description');
    document.getElementById('coordinates').innerHTML = result.get('coordinates.latitude') + 
        ' ' + result.get('coordinates.longitude');
}

function cbFailure(error) {
    console.log('geopoints_detail: failed with error: ' + error);
}

function display() {
    odkData.getViewData(cbSuccess, cbFailure);
}


/**
 * The file for displaying a detail view.
 */
/* global odkData */
/*exported display */
'use strict';

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
    var latitude = result.get('coordinates.latitude');
    var longitude = result.get('coordinates.longitude');
    if (latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined) {
        document.getElementById('coordinates').innerHTML = latitude + 
        ' ' + longitude;
    }
}

function cbFailure(error) {
    console.log('geopoints_detail: failed with error: ' + error);
}

function display() {
    odkData.getViewData(cbSuccess, cbFailure);
}


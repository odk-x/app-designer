/**
 * The file for displaying detail views of the Tea Houses table.
 */
/* global $, control, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/Tea_houses_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            window.data.setBackingObject(dataObj);
        }
    });
}
 
function display() {
    $('#TITLE').text(data.get('Name'));
    $('#FIELD_2').text(data.get('State'));
    $('#FIELD_3').text(data.get('Region'));
    $('#FIELD_4').text(data.get('District'));
    $('#FIELD_5').text(data.get('Neighborhood'));

    // We're going to get the type name from the Tea Types table.
    var typeData = control.query(
            'Tea_types',
            'Type_id = ?',
            [data.get('Specialty_Type_id')]);

    $('#FIELD_6').text(typeData.getData(0, 'Name'));

    $('#FIELD_13').text(data.get('Date_Opened'));
    $('#FIELD_7').text(data.get('Customers'));
    $('#FIELD_18').text(data.get('Visits'));

    // The latitude and longitude are stored in a single column as GeoPoint.
    // We need to extract the lat/lon from the GeoPoint.
    var geopoint = data.get('GeoPoint');
    var latLon = geopoint.split(',');
    var lat = latLon[0];
    var lon = latLon[1];
    $('#FIELD_8').text(lat);
    $('#FIELD_9').text(lon);
    $('#FIELD_17').text(data.get('House_id'));

    if(data.get('Iced') === 'Yes') {
        $('#FIELD_10').attr('checked', true);
    }
    $('#FIELD_10').attr('disabled', true);
    if(data.get('Hot') === 'Yes') {
        $('#FIELD_11').attr('checked', true);
    }
    $('#FIELD_11').attr('disabled', true);
    if(data.get('WiFi') === 'Yes') {
        $('#FIELD_12').attr('checked', true);
    }
    $('#FIELD_12').attr('disabled', true);

    $('#FIELD_14').text(data.get('Owner'));
    $('#FIELD_15').text(data.get('Phone_Number'));

    var results = control.query(
            'Tea_inventory',
            'House_id = ?',
            [data.get('House_id')]);
    $('#FIELD_16').text(results.getCount());

}


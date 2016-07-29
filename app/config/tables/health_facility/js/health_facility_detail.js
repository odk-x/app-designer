/**
 * The file for displaying detail views of the Health Facilities table.
 */
/* global $, odkTables */
'use strict';

// Handle the case where we are debugging in chrome.
// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/health_facility_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }

var healthFacilityResultSet = {}; 
var typeData = {};

function onLinkClick() {

    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        odkTables.openTableToListView(
          'refrigerators',
          'facility_id = ?',
          [healthFacilityResultSet.get('facility_id')],
          'config/tables/refrigerators/html/refrigerators_list.html');
    }
}

function cbSuccess(result) {

    healthFacilityResultSet = result;

    // CAL: I'm not positive that this is all we need to change to get this to work!!
    odkData.query('refrigerators', 'facility_id = ?', [healthFacilityResultSet.get('facility_id')], 
        null, null, null, null, true, refrigeratorsCBSuccess, refrigeratorsCBFailure);
}

function cbFailure(error) {

    console.log('health_facility_detail getViewData CB error : ' + error);
}

var display = function() {

    odkData.getViewData(cbSuccess, cbFailure);
}

function refrigeratorTypeCBSuccess(result) {

    console.log('health_facility_detail refrigerator type query CB success');
    typeData = result;
}

function refrigeratorTypeCBFailure(error) {

    console.log('health_facility_detail refrigerator type query CB error : ' + error);
}

function refrigeratorsCBSuccess(invData) {

    $('#TITLE').text(healthFacilityResultSet.get('Name'));

    $('#fac_id').text(healthFacilityResultSet.get('facility_id'));
    $('#fac_type').text(util.formatDisplayText(
        healthFacilityResultSet.get('facility_type')));
    $('#ownership').text(util.formatDisplayText(
        healthFacilityResultSet.get('ownership')));
    $('#population').text(healthFacilityResultSet.get('population'));
    // $('#coverage').text(healthFacilityResultSet.get('coverage'));
    $('#elec_source').text(util.formatDisplayText(
        healthFacilityResultSet.get('elec_source')));
    $('#grid_avail').text(util.formatDisplayText(
        healthFacilityResultSet.get('grid')));
    $('#gas_avail').text(util.formatDisplayText(
        healthFacilityResultSet.get('gas')));
    $('#ker_avail').text(util.formatDisplayText(
        healthFacilityResultSet.get('kerosene')));
    $('#solar_climate').text(util.formatDisplayText(
        healthFacilityResultSet.get('solar_suitable')));
    // $('#solar_site').text(healthFacilityResultSet.get('solar_suitable'));
    $('#climate').text(util.formatDisplayText(
        healthFacilityResultSet.get('climate')));
    $('#dist_to_supply').text(healthFacilityResultSet.get('distance_to_supply'));

    // The latitude and longitude are stored in a single column as GeoPoint.
    // We need to extract the lat/lon from the GeoPoint.
    var lat = healthFacilityResultSet.get('Location.latitude');
    var lon = healthFacilityResultSet.get('Location.longitude');
    $('#lat').text(lat);
    $('#lon').text(lon);

    $('#in_charge').text(healthFacilityResultSet.get('person_in_charge'));
    console.log('Phone number: ' + healthFacilityResultSet.get('phone_number'));
    $('#mobile_no').text(healthFacilityResultSet.get('phone_number'));
    $('#email').text(healthFacilityResultSet.get('email'));
    $('#updated').text(healthFacilityResultSet.get('date_updated'));

    $('#fridge_list').text(invData.getCount());

}

function refrigeratorsCBFailure(error ) {
    console.log('health_facility_detail refrigerators query CB error : ' + error);
}

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

function onLinkClick() {

    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        odkTables.openTableToListView(
          'refrigerators',
          'facility_row_id = ?',
          [healthFacilityResultSet.get('_id')],
          'config/tables/refrigerators/html/refrigerators_list.html');
    }
}

function cbSuccess(result) {

    healthFacilityResultSet = result;

    odkData.query('refrigerators', 'facility_row_id = ?', [healthFacilityResultSet.get('_id')], 
        null, null, null, null, true, refrigeratorsCBSuccess, refrigeratorsCBFailure);
}

function cbFailure(error) {

    console.log('health_facility_detail getViewData CB error : ' + error);
}

var display = function() {

    odkData.getViewData(cbSuccess, cbFailure);

}

function refrigeratorsCBSuccess(invData) {

    $('#TITLE').text(healthFacilityResultSet.get('facility_name'));

    $('#facility_id').text(healthFacilityResultSet.get('facility_id'));
    $('#facility_type').text(util.formatDisplayText(
        healthFacilityResultSet.get('facility_type')));
    $('#facility_ownership').text(util.formatDisplayText(
        healthFacilityResultSet.get('facility_ownership')));
    $('#facility_population').text(healthFacilityResultSet.get('facility_population'));
    $('#facility_coverage').text(healthFacilityResultSet.get('facility_coverage') + '%');
    $('#admin_region').text(healthFacilityResultSet.get('admin_region'));

    $('#electricity_source').text(util.formatDisplayText(
        healthFacilityResultSet.get('electricity_source')));
    $('#grid_availability').text(util.formatDisplayText(
        healthFacilityResultSet.get('grid_power_availability')));
    $('#gas_availability').text(util.formatDisplayText(
        healthFacilityResultSet.get('gas_availability')));
    $('#kerosene_availability').text(util.formatDisplayText(
        healthFacilityResultSet.get('kerosene_availability')));
    $('#solar_suitable_climate').text(util.formatDisplayText(
        healthFacilityResultSet.get('solar_suitable_climate')));
    $('#solar_suitable_site').text(util.formatDisplayText(
        healthFacilityResultSet.get('solar_suitable_site')));

    $('#climate').text(util.formatDisplayText(
        healthFacilityResultSet.get('climate_zone')));
    // The latitude and longitude are stored in a single column as GeoPoint.
    // We need to extract the lat/lon from the GeoPoint.
    var lat = healthFacilityResultSet.get('Location.latitude');
    var lon = healthFacilityResultSet.get('Location.longitude');
    $('#lat').text(lat);
    $('#lon').text(lon);

    $('#distance_to_supply').text(healthFacilityResultSet.get('distance_to_supply') + ' km');
    $('#supply_interval').text(healthFacilityResultSet.get('vaccine_supply_interval'));
    $('#stock_requirement').text(healthFacilityResultSet.get(
        'vaccine_reserve_stock_requirement'));    
    $('#supply_mode').text(util.formatDisplayText(
        healthFacilityResultSet.get('vaccine_supply_mode')));


    $('#fridge_list').text(invData.getCount());

}

function refrigeratorsCBFailure(error) {

    console.log('health_facility_detail refrigerators query CB error : ' + error);

}

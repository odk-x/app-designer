/**
 * The file for displaying detail views of the Health Facilities table.
 */
/* global $, odkTables, util, odkData */
'use strict';

var healthFacilityResultSet = {};

function onLinkClick() {

    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        var rowIdQueryParams = util.getKeyToAppendToColdChainURL(util.facilityRowId, healthFacilityResultSet.get('_id'));
        odkTables.launchHTML(null, 
            'config/tables/refrigerators/html/refrigerators_list.html' + rowIdQueryParams);
    }
}

function onAddFridgeClick() {
    var jsonMap = {};
    jsonMap.facility_row_id = healthFacilityResultSet.getRowId(0);
	jsonMap.refrigerator_id = util.genUUID();
	jsonMap._default_access = healthFacilityResultSet.get('_default_access');
	jsonMap._group_read_only = healthFacilityResultSet.get('_group_read_only');
	jsonMap._group_modify = healthFacilityResultSet.get('_group_modify');
	jsonMap._group_privileged = healthFacilityResultSet.get('_group_privileged');

    odkTables.addRowWithSurvey(null, 'refrigerators', 'refrigerators', null, jsonMap);
}

function onEditFacility() {
    if (!$.isEmptyObject(healthFacilityResultSet)) {
        odkTables.editRowWithSurvey(null, healthFacilityResultSet.getTableId(), healthFacilityResultSet.getRowId(0), 'health_facility', null, null);
    }
}

function onDeleteFacility() {
    if (!$.isEmptyObject(healthFacilityResultSet)) {
        if (confirm('Are you sure you want to delete this health facility?')) {

            odkData.deleteRow(healthFacilityResultSet.getTableId(),
                null,
                healthFacilityResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);           
        }
    }
}

function cbDeleteSuccess() {
    console.log('health facility deleted successfully');
}

function cbDeleteFailure(error) {

    console.log('health facility delete failure CB error : ' + error);
}

function cbSuccess(result) {

    healthFacilityResultSet = result;

     var access = healthFacilityResultSet.get('_effective_access');

    if (access.indexOf('w') !== -1) {
        var editButton = $('#editFacilityBtn');
        editButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delFacilityBtn');
        deleteButton.removeClass('hideButton');
    }

    odkData.query('refrigerators', 'facility_row_id = ?', [healthFacilityResultSet.get('_id')],
        null, null, null, null, null, null, true, refrigeratorsCBSuccess, refrigeratorsCBFailure);
}

function cbFailure(error) {

    console.log('health_facility_detail getViewData CB error : ' + error);
}

function display() {

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

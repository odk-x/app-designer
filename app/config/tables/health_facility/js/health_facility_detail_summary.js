/**
 * The file for displaying detail views of the Health Facilities table.
 */
/* global $, odkTables, util, odkData */
'use strict';

function cbSuccess(healthFacilityResultSet) {

    $('#TITLE').text(healthFacilityResultSet.get('facility_name'));

    $('#facility_id').text(healthFacilityResultSet.get('facility_id'));
    $('#facility_type').text(util.formatDisplayText(
        healthFacilityResultSet.get('facility_type')));
    $('#contact_name').text(healthFacilityResultSet.get('contact_name'));
    $('#contact_phone_number').text(healthFacilityResultSet.get('contact_phone_number'));
    $('#catchment_population').text(healthFacilityResultSet.get('catchment_population'));
    $('#facility_ownership').text(util.formatDisplayText(
        healthFacilityResultSet.get('facility_ownership')));
    $('#admin_region').text(healthFacilityResultSet.get('admin_region'));

    $('#electricity_source').text(util.formatDisplayText(
        healthFacilityResultSet.get('electricity_source')));
    $('#grid_availability').text(util.formatDisplayText(
        healthFacilityResultSet.get('grid_power_availability')));
    $('#fuel_availability').text(util.formatDisplayText(
        healthFacilityResultSet.get('fuel_availability')));

    // The latitude and longitude are stored in a single column as GeoPoint.
    // We need to extract the lat/lon from the GeoPoint.
    var lat = healthFacilityResultSet.get('Location.latitude');
    var lon = healthFacilityResultSet.get('Location.longitude');
    $('#lat').text(lat);
    $('#lon').text(lon);

    $('#distance_to_supply').text(healthFacilityResultSet.get('distance_to_supply') + ' km');
    $('#supply_interval').text(healthFacilityResultSet.get('vaccine_supply_interval'));
    $('#supply_mode').text(util.formatDisplayText(
        healthFacilityResultSet.get('vaccine_supply_mode')));

}

function cbFailure(error) {

    console.log('health_facility_detail getViewData CB error : ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#basic-facility-information').text(odkCommon.localizeText(locale, "basic_facility_information"));
    $('#health-fac-id').text(odkCommon.localizeText(locale, "health_facility_id"));
    $('#fac-type').text(odkCommon.localizeText(locale, "facility_type"));
    $('#con-name').text(odkCommon.localizeText(locale, "contact_name"));
    $('#con-ph-num').text(odkCommon.localizeText(locale, "contact_phone_number"));
    $('#catch-pop').text(odkCommon.localizeText(locale, "catchment_population"));
    $('#ownership').text(odkCommon.localizeText(locale, "ownership"));
    $('#admin-reg').text(odkCommon.localizeText(locale, "admin_region"));

    $('#power-information').text(odkCommon.localizeText(locale, "power_information"));
    $('#elec-source').text(odkCommon.localizeText(locale, "electricity_source"));
    $('#grid-avail').text(odkCommon.localizeText(locale, "grid_availability"));
    $('#fuel-avail').text(odkCommon.localizeText(locale, "fuel_availability"));

    $('#loc-info').text(odkCommon.localizeText(locale, "location_information"));
    $('#lat-gps').text(odkCommon.localizeText(locale, "latitude_gps"));
    $('#long-gps').text(odkCommon.localizeText(locale, "longitude_gps"));

    $('#stk-info').text(odkCommon.localizeText(locale, "stock_information"));
    $('#dist-to-sup-pt').text(odkCommon.localizeText(locale, "distance_to_supply_point"));
    $('#vac-sup-interval').text(odkCommon.localizeText(locale, "vaccine_supply_interval"));
    $('#vac-sup-mode').text(odkCommon.localizeText(locale, "vaccine_supply_mode"));

    var facId = util.getQueryParameter(util.facilityRowId);

    odkData.query('health_facility', '_id = ?', [facId], null, null, null, null, null, null, true,
        cbSuccess, cbFailure);
    odkData.getViewData(cbSuccess, cbFailure);
}


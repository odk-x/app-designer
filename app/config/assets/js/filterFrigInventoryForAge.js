/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */
var noOptionSelectString = "none";
var regionQueryString = 'regionLevel2 = ?';
var typeQueryString = 'facility_type = ?';

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var locale = odkCommon.getPreferredLocale();
    $('#facility-inventory-by-grid').text(odkCommon.localizeText(locale, "facility_inventory_by_grid_power"));

    $('#select-region').text(odkCommon.localizeText(locale, "select_region"));
    $('#all-regions').text(odkCommon.localizeText(locale, "all_regions"));
    $('#north').text(odkCommon.localizeText(locale, "north"));
    $('#central-west').text(odkCommon.localizeText(locale, "central_west"));
    $('#central-east').text(odkCommon.localizeText(locale, "central_east"));
    $('#south-west').text(odkCommon.localizeText(locale, "south_west"));
    $('#south-east').text(odkCommon.localizeText(locale, "south_east"));

    $('#select-facility-type').text(odkCommon.localizeText(locale, "select_facility_type"));
    $('#all-types').text(odkCommon.localizeText(locale, "all_types"));  
    $('#central-hospital').text(odkCommon.localizeText(locale, "select_region"));
    $('#community-hospital').text(odkCommon.localizeText(locale, "community_hospital"));
    $('#dispensary').text(odkCommon.localizeText(locale, "dispensary"));
    $('#district-hospital').text(odkCommon.localizeText(locale, "district_hospital"));
    $('#district-vaccine-store').text(odkCommon.localizeText(locale, "district_vaccine_store"));
    $('#health-center').text(odkCommon.localizeText(locale, "health_center"));
    $('#health-post').text(odkCommon.localizeText(locale, "health_post"));
    $('#hospital').text(odkCommon.localizeText(locale, "hospital"));
    $('#national-vaccine-store').text(odkCommon.localizeText(locale, "national_vaccine_store"));
    $('#regional-vaccine-store').text(odkCommon.localizeText(locale, "regional_vaccine_store"));
    $('#rural-hospital').text(odkCommon.localizeText(locale, "rural_hospital"));

    $('#select-power-source').text(odkCommon.localizeText(locale, "select_power_source"));
    $('#all-power-sources').text(odkCommon.localizeText(locale, "all_power_sources"));
    $('#electricity').text(odkCommon.localizeText(locale, "electricity"));
    $('#gas').text(odkCommon.localizeText(locale, "gas"));
    $('#kerosene').text(odkCommon.localizeText(locale, "kerosene"));
    $('#solar').text(odkCommon.localizeText(locale, "solar"));
    $('#unknown').text(odkCommon.localizeText(locale, "unknown"));

    $('#filter-facilities-by-region-type').text(odkCommon.localizeText(locale, "filter"));

    var filterFacilitiesButton = $('#filter-facilities-by-region-type');
    filterFacilitiesButton.on(
        'click',
        function() {
            // Get the value of the type
            var facilityType = $("#facility_type").val();

            // Get the value of the region
            var facilityRegion = $("#facility_region").val();

            // Get the value of the region
            var powerSource = $("#power_source").val();

            var queryParam = util.getKeysToAppendToColdChainURL(facilityType, facilityRegion, null, powerSource);

            //odkTables.openTableToMapView('health_facility', selection, selectionArgs, 'config/tables/health_facility/html/hFacility_list.html');
            odkTables.launchHTML(null,'config/assets/graphFrigInventoryForAge.html' + queryParam);
        }
    );
}

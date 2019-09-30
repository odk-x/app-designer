/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

async function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var locale = odkCommon.getPreferredLocale();
    $('#facility-inventory-by-grid-power').text(odkCommon.localizeText(locale, "facility_inventory_by_grid_power"));

    $('#select-region').text(odkCommon.localizeText(locale, "select_region"));

    $('#select-facility-type').text(odkCommon.localizeText(locale, "select_facility_type"));
    $('#all-types').text(odkCommon.localizeText(locale, "all_types"));

    // Get max number of admin regions
    var maxAdminRegionLevelNumber = await util.getMaxLevel();

    var regionDiv = $('#regionDiv');
    regionDisplayUtil.appendRegionSelectsToDiv(regionDiv, maxAdminRegionLevelNumber);

    healthFacilityTypeUtil.appendHealthFacilityOptions($('#facility_type'));

    $('#filter-facilities-by-region-type').text(odkCommon.localizeText(locale, "filter"));

    var filterFacilitiesButton = $('#filter-facilities-by-region-type');
    filterFacilitiesButton.on(
        'click',
        function() {
            // Get the value of the type
            var facilityType = $("#facility_type").val();

            // Get the value of the region
            var facilityRegionJson = regionDisplayUtil.getLowestAdminRegionInfo(maxAdminRegionLevelNumber);
            var facilityRegionLevel = (facilityRegionJson != null && facilityRegionJson[util.adminRegionLevel]) ?
                facilityRegionJson[util.adminRegionLevel] : null;
            var facilityRegion = (facilityRegionJson != null && facilityRegionJson[util.adminRegionName]) ?
                facilityRegionJson[util.adminRegionName] : null;

            var queryParam = util.getKeysToAppendToColdChainURL(facilityType, facilityRegionLevel, facilityRegion, null);

            odkTables.launchHTML(null,'config/assets/graphFacilityInventoryForGridPower.html' + queryParam);
        }
    );
}

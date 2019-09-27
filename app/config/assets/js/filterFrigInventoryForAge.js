/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */
var maxAdminRegionLevelNumber = util.maxLevelAppDepth;

// TODO: Clarify admin_region and admin_region_id
async function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var locale = odkCommon.getPreferredLocale();
    $('#refrigerator-inventory-by-age').text(odkCommon.localizeText(locale, "refrigerator_inventory_by_age"));

    $('#select-facility-type').text(odkCommon.localizeText(locale, "select_facility_type"));
    $('#all-types').text(odkCommon.localizeText(locale, "all_types"));

    $('#select-power-source').text(odkCommon.localizeText(locale, "select_power_source"));
    $('#all-power-sources').text(odkCommon.localizeText(locale, "all_power_sources"));


    $('#filter-facilities-by-region-type').text(odkCommon.localizeText(locale, "filter"));

    var filterFacilitiesButton = $('#filter-facilities-by-region-type');
    filterFacilitiesButton.on(
        'click',
        function() {
            // Get the value of the type
            var facilityType = $("#facility_type").val();

            var facilityRegionJson = regionDisplayUtil.getLowestAdminRegionInfo(maxAdminRegionLevelNumber);
            var facilityRegionLevel = facilityRegionJson[util.adminRegionLevel];
            var facilityRegion = facilityRegionJson[util.adminRegionName];

            // Get the value of the region
            var powerSource = $("#power_source").val();

            var queryParam = util.getKeysToAppendToColdChainURL(facilityType, facilityRegionLevel, facilityRegion, powerSource);

            odkTables.launchHTML(null,'config/assets/graphFrigInventoryForAge.html' + queryParam);
        }
    );

    // Get max number of admin regions
    maxAdminRegionLevelNumber = await util.getMaxLevel();

    var regionDiv = $('#regionDiv');
    regionDisplayUtil.appendRegionSelectsToDiv(regionDiv, maxAdminRegionLevelNumber);

    healthFacilityTypeUtil.appendHealthFacilityOptions($('#facility_type'));

    // Get values relevant for power sources
    var refrigeratorResult = await util.getOneRefrigeratorRow();
    var refrigeratorPowerChoices = refrigeratorResult.getColumnChoicesList('power_source');
    for (var i = 0; i < refrigeratorPowerChoices.length; i++) {
        var refPowerChoiceVal = refrigeratorPowerChoices[i].data_value;
        var refPowerChoiceName = odkCommon.localizeText(locale, refrigeratorPowerChoices[i].display.title);

        var powerOp = $('<option>');
        powerOp.attr('id', refPowerChoiceVal);
        powerOp.attr('value', refPowerChoiceVal);
        powerOp.text(refPowerChoiceName);
        $('#power_source').append(powerOp);
    }
}

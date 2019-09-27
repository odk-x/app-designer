/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */
var maxAdminRegionLevelNumber = util.maxLevelAppDepth;

var facility_region_level = 'facility_region_level';
var select_region_level = 'select_region_level';

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

            // Get the value of the region
            // This will be the lowest level that is different from none
            var facilityRegion = null;
            var facilityRegionLevel = null;
            for (var facIdx = util.firstLevelNumber; facIdx <= maxAdminRegionLevelNumber; facIdx++) {
                var tempId = '#' + facility_region_level + facIdx;
                var tempReg = $(tempId).val();
                if (tempReg !== 'none') {
                   facilityRegion = $(tempId).val();
                   facilityRegionLevel = facIdx;
                } else {
                    break;
                }
            }

            // Get the value of the region
            var powerSource = $("#power_source").val();

            var queryParam = util.getKeysToAppendToColdChainURL(facilityType, facilityRegionLevel, facilityRegion, powerSource);

            //odkTables.openTableToMapView('health_facility', selection, selectionArgs, 'config/tables/health_facility/html/hFacility_list.html');
            odkTables.launchHTML(null,'config/assets/graphFrigInventoryForAge.html' + queryParam);
        }
    );

    var regionDiv = $('#regionDiv');

    // Get max number of admin regions
    maxAdminRegionLevelNumber = await util.getMaxLevel();

    // Create the necessary dropdowns for region selection
    for (var i = util.firstLevelNumber; i <= maxAdminRegionLevelNumber; i++) {
        // Get values relevant for admin regions
        var selectAdminRegion = $('<select>');
        var selectAdminRegionId = facility_region_level + i;
        selectAdminRegion.attr('id', selectAdminRegionId);
        selectAdminRegion.attr('class', 'form-control');
        selectAdminRegion.attr('data-level', i);

        // Add all regions options
        // Can't put this in html due to dynamic max region level
        var optAllRegion = getAllRegionOption(i);
        optAllRegion.attr('selected', true);
        selectAdminRegion.append(optAllRegion);

        // TODO: Would an await be better here?
        selectAdminRegion.on('change', function(evt) {
            console.log(evt.target.value);
            var changedAdminRegionId = '#' + evt.target.id;
            var clickedAdminRegionLevel = parseInt($(changedAdminRegionId).attr('data-level'));

            // For all selects after this - clear their options
            for (var regIdx = clickedAdminRegionLevel + 1; regIdx <= maxAdminRegionLevelNumber; regIdx++) {
                var subAdminRegionId = facility_region_level + regIdx;
                var subAdminRegion = $('#' +  subAdminRegionId);
                subAdminRegion.empty();

                // Add all regions option back
                var subAllRegionOpt = getAllRegionOption(regIdx);
                subAdminRegion.append(subAllRegionOpt);
            }

            var currRegionName = $(changedAdminRegionId + " option:selected").text();
            // Get options for subsequent region
            if (clickedAdminRegionLevel + 1 <= maxAdminRegionLevelNumber) {
                // Set these select options as well
                util.getNextAdminRegionsFromCurrAdminRegionPromise(clickedAdminRegionLevel + 1, currRegionName).then(function(result) {
                        for (var resIdx = 0; resIdx < result.getCount(); resIdx++) {
                             var filteredRegOpt = createAdminRegionOption(result, resIdx, clickedAdminRegionLevel + 1);
                             var nextRegId = '#' + facility_region_level + (clickedAdminRegionLevel + 1);
                             var nextReg = $(nextRegId);
                             nextReg.append(filteredRegOpt);
                        }
                    });
            }
        });

        var labelAdminRegion = $('<label>')
        var labelAdminRegionId = select_region_level + i;
        labelAdminRegion.attr('id', labelAdminRegionId);
        labelAdminRegion.attr('class', 'form-label');
        labelAdminRegion.attr('for', selectAdminRegionId);
        var regionLabel = odkCommon.localizeText(locale, 'select_region') + i + ':';
        labelAdminRegion.text(regionLabel);

        regionDiv.append(labelAdminRegion);
        regionDiv.append(selectAdminRegion);
    }

    // Set values for first admin region dropdown
    // Other dropdowns will be set only if a value is set for the first one
    // TODO: CLEAN!!
    var firstRegId = '#' + facility_region_level + util.firstLevelNumber;
    var firstReg = $(firstRegId);
    util.getNextAdminRegionsFromCurrAdminRegionPromise(util.firstLevelNumber)
        .then(function(result) {
            for (var resIdx = 0; resIdx < result.getCount(); resIdx++) {
                var regOpt = createAdminRegionOption(result, resIdx, util.firstLevelNumber);
                firstReg.append(regOpt);
            }
    });

    var healthFacilityResult = await util.getOneFacilityRow();
    var refrigeratorResult = await util.getOneRefrigeratorRow();

    // Get values relevant for facility type
    var healthFacilityTypeChoices = healthFacilityResult.getColumnChoicesList('facility_type');
    for (var i = 0; i < healthFacilityTypeChoices.length; i++) {
        var healthFacilityTypeVal = healthFacilityTypeChoices[i].data_value;
        var healthFacilityTypeName = odkCommon.localizeText(locale, healthFacilityTypeChoices[i].display.title);

        var typeOp = $('<option>');
        typeOp.attr('id', healthFacilityTypeVal);
        typeOp.attr('value', healthFacilityTypeVal);
        typeOp.text(healthFacilityTypeName);

        $('#facility_type').append(typeOp);
    }

    // Get values relevant for power sources
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

// TODO: Can these 2 functions be combined?
function createAdminRegionOption(result, resIdx, regionLevel) {
    // Create options from result
    var optAllRegion = $('<option>');
    var optAllRegionId = result.getData(resIdx, '_id');
    var adminRegionLevelVal = util.regionLevel + (regionLevel);
    var optAllRegionDisplay = result.getData(resIdx, adminRegionLevelVal);
    optAllRegion.attr('id', optAllRegionId);
    optAllRegion.attr('value', optAllRegionDisplay);
    optAllRegion.text(optAllRegionDisplay);
    return optAllRegion;
}

function getAllRegionOption(level) {
    var optAllRegion = $('<option>');
    var optAllRegionVal = 'none';
    var optAllRegionId = optAllRegionVal + level;
    var locale = odkCommon.getPreferredLocale();
    var optAllRegionDisplay = odkCommon.localizeText(locale, "all_regions");
    optAllRegion.attr('id', optAllRegionId);
    optAllRegion.attr('value', optAllRegionVal);
    optAllRegion.text(optAllRegionDisplay);
    optAllRegion.attr('selected', true);
    return optAllRegion;
}

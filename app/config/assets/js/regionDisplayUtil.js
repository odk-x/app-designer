/* global odkData*/
/**
 * Various functions for displaying region
 */
'use strict';

var regionDisplayUtil = {};
regionDisplayUtil.select_region_level = 'select_region_level';
regionDisplayUtil.facility_region_level = 'facility_region_level';

regionDisplayUtil.appendRegionSelectsToDiv = async function(regionDiv, maxAdminRegionLevelNumber) {

    // Create the necessary dropdowns for region selection
    for (var i = util.firstLevelNumber; i <= maxAdminRegionLevelNumber; i++) {
        // Get values relevant for admin regions
        var selectAdminRegion = $('<select>');
        var selectAdminRegionId = regionDisplayUtil.facility_region_level + i;
        selectAdminRegion.attr('id', selectAdminRegionId);
        selectAdminRegion.attr('class', 'form-control');
        selectAdminRegion.attr('data-level', i);

        // Add all regions options
        // Can't put this in html due to dynamic max region level
        var optAllRegion = regionDisplayUtil.getAllRegionOption(i);
        optAllRegion.attr('selected', true);
        selectAdminRegion.append(optAllRegion);

        // TODO: Would an await be better here?
        selectAdminRegion.on('change', function(evt) {
            console.log(evt.target.value);
            var changedAdminRegionId = '#' + evt.target.id;
            var clickedAdminRegionLevel = parseInt($(changedAdminRegionId).attr('data-level'));

            // For all selects after this - clear their options
            for (var regIdx = clickedAdminRegionLevel + 1; regIdx <= maxAdminRegionLevelNumber; regIdx++) {
                var subAdminRegionId = regionDisplayUtil.facility_region_level + regIdx;
                var subAdminRegion = $('#' +  subAdminRegionId);
                subAdminRegion.empty();

                // Add all regions option back
                var subAllRegionOpt = regionDisplayUtil.getAllRegionOption(regIdx);
                subAdminRegion.append(subAllRegionOpt);
            }

            var currRegionName = $(changedAdminRegionId + " option:selected").text();
            // Get options for subsequent region
            if (clickedAdminRegionLevel + 1 <= maxAdminRegionLevelNumber) {
                // Set these select options as well
                util.getNextAdminRegionsFromCurrAdminRegionPromise(clickedAdminRegionLevel + 1, currRegionName)
                .then(function(result) {
                    for (var resIdx = 0; resIdx < result.getCount(); resIdx++) {
                        var filteredRegOpt = regionDisplayUtil.createAdminRegionOption(result, resIdx, clickedAdminRegionLevel + 1);
                        var nextRegId = '#' + regionDisplayUtil.facility_region_level + (clickedAdminRegionLevel + 1);
                        var nextReg = $(nextRegId);
                        nextReg.append(filteredRegOpt);
                    }
                });
            }
        });

        var labelAdminRegion = $('<label>')
        var labelAdminRegionId = regionDisplayUtil.select_region_level + i;
        labelAdminRegion.attr('id', labelAdminRegionId);
        labelAdminRegion.attr('class', 'form-label');
        labelAdminRegion.attr('for', selectAdminRegionId);
        var locale = odkCommon.getPreferredLocale();
        var regionLabel = odkCommon.localizeText(locale, 'select_region') + i + ':';
        labelAdminRegion.text(regionLabel);

        regionDiv.append(labelAdminRegion);
        regionDiv.append(selectAdminRegion);
    }

    // Set values for first admin region dropdown
    // Other dropdowns will be set only if a value is set for the first one
    // TODO: CLEAN!!
    var firstRegId = '#' + regionDisplayUtil.facility_region_level + util.firstLevelNumber;
    var firstReg = $(firstRegId);
    util.getNextAdminRegionsFromCurrAdminRegionPromise(util.firstLevelNumber)
    .then(function (result) {
        for (var resIdx = 0; resIdx < result.getCount(); resIdx++) {
            var regOpt = regionDisplayUtil.createAdminRegionOption(result, resIdx, util.firstLevelNumber);
            firstReg.append(regOpt);
        }
    });
};

// TODO: Can these 2 functions be combined?
regionDisplayUtil.createAdminRegionOption = function(result, resIdx, regionLevel) {
    // Create options from result
    var optAllRegion = $('<option>');
    var optAllRegionId = result.getData(resIdx, '_id');
    var adminRegionLevelVal = util.regionLevel + (regionLevel);
    var optAllRegionDisplay = result.getData(resIdx, adminRegionLevelVal);
    optAllRegion.attr('id', optAllRegionId);
    optAllRegion.attr('value', optAllRegionDisplay);
    optAllRegion.text(optAllRegionDisplay);
    return optAllRegion;
};

regionDisplayUtil.getAllRegionOption = function(level) {
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
};

regionDisplayUtil.getLowestAdminRegionInfo = function(maxAdminRegionLevelNumber) {
    // Get the value of the region
    // This will be the lowest level that is different from none
    var adminRegion = [];
    for (var facIdx = util.firstLevelNumber; facIdx <= maxAdminRegionLevelNumber; facIdx++) {
        var tempId = '#' + regionDisplayUtil.facility_region_level + facIdx;
        var tempReg = $(tempId).val();
        if (tempReg !== 'none') {
            adminRegion[util.adminRegionId] = $(tempId).attr('id');
            adminRegion[util.adminRegionName] = $(tempId).val();
            adminRegion[util.adminRegionLevel] = facIdx;
        } else {
            break;
        }
    }

    return adminRegion;
};

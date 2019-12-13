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
    $('#add-health-facility').text(odkCommon.localizeText(locale, "add_health_facility"));
    $('#add-facility').text(odkCommon.localizeText(locale, "add_facility"));

    // Get max number of admin regions
    var maxAdminRegionLevelNumber = await util.getMaxLevel();

    var regionDiv = $('#regionDiv');
    regionDisplayUtil.appendRegionSelectsToDiv(regionDiv, maxAdminRegionLevelNumber);

    var addFacilitiesButton = $('#add-facility');
    addFacilitiesButton.on(
        'click',
        function () {
            // Get the appropriate admin region
            var facilityRegionJson = regionDisplayUtil.getLowestAdminRegionInfo(maxAdminRegionLevelNumber);
            if (facilityRegionJson === null || facilityRegionJson === undefined) {
                var alertMsg = odkCommon.localizeText(locale, "select_a_region_to_add_a_facility");
                alert(alertMsg);
                return;
            }

            var defaults = {};
            defaults['admin_region_id'] = facilityRegionJson[util.adminRegionId];
            defaults['_group_read_only'] = facilityRegionJson[util.groupReadOnly];
            defaults['_group_modify'] = facilityRegionJson[util.groupModify];
            defaults['_group_privileged'] = facilityRegionJson[util.groupPrivileged];
            defaults['_default_access'] = util.hiddenDefaultAccess;
            odkTables.addRowWithSurvey(null, 'health_facilities', 'health_facilities', null, defaults);
        });
}

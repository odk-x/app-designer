/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables, util */

var adminRegionQueryStr = 'admin_region = ?';

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var locale = odkCommon.getPreferredLocale();
    $('#view-facilities').text(odkCommon.localizeText(locale, "view_all_health_facilities"));
    $('#filter-facilities').text(odkCommon.localizeText(locale, "filter_health_facilities_by_type"));
    $('#view-all-refrigerators').text(odkCommon.localizeText(locale, "view_all_refrigerators"));
    $('#view-service-refrigerators').text(odkCommon.localizeText(locale, "view_all_refrigerators_needing_service"));
    $('#view-models').text(odkCommon.localizeText(locale, "view_refrigerator_models"));

    var hdr1 = $('#header1');
    var linkedRegion = util.getQueryParameter(util.adminRegion);
    var linkedRegionId = util.getQueryParameter(util.adminRegionId);

    if (linkedRegion !== null) {
        hdr1.text(linkedRegion);
    }

    var viewFacilitiesButton = $('#view-facilities');
    viewFacilitiesButton.on(
        'click',
        function() {
            var uriParams = util.getKeyToAppendToColdChainURL(util.adminRegion, linkedRegionId);
             odkTables.openTableToMapView(null, 'health_facility',
                adminRegionQueryStr, [linkedRegionId], 'config/tables/health_facility/html/hFacility_list.html' + uriParams);
        }
    );

    var filterFacilitiesButton = $('#filter-facilities');
    filterFacilitiesButton.on(
        'click',
        function() {
            var filterQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegion, linkedRegionId);
            filterQueryParams = filterQueryParams + util.getKeyToAppendToColdChainURL(util.adminRegionName,
                linkedRegion, false);
            odkTables.launchHTML(null,
                'config/assets/filterHealthFacilitiesByType.html' + filterQueryParams);
        }
    );

    var viewRefrigeratorsButton = $('#view-all-refrigerators');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            var frigQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegion, linkedRegionId);
            odkTables.launchHTML(null,
                'config/tables/refrigerators/html/refrigerators_list.html' + frigQueryParams);
        }
    );

    var viewServiceRefrigeratorsButton = $('#view-service-refrigerators');
    viewServiceRefrigeratorsButton.on(
        'click',
        function() {
            var serviceQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegion, linkedRegionId);

            odkTables.launchHTML(null,
                'config/tables/refrigerators/html/refrigerators_service_list.html' + serviceQueryParams);
    });

    var viewRefrigeratorModelsButton = $('#view-models');
    viewRefrigeratorModelsButton.on(
        'click',
        function() {
            odkTables.openTableToListView(null,
                'refrigerator_types',
                null,
                null,
                'config/tables/refrigerator_types/html/refrigerator_types_list.html');
        }
    );

}

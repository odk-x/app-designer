/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables, util */

var adminRegionQueryStr = 'admin_region_id = ? AND _sync_state != ?';
var viewFacilitiesNavigateButton = $('#view-facilities-navigate');

async function display() {

    var body = $('#main');

    var locale = odkCommon.getPreferredLocale();
    $('#view-facilities-map').text(odkCommon.localizeText(locale, "view_map_of_all_health_facilities"));
    $('#view-facilities-list').text(odkCommon.localizeText(locale, "view_list_of_all_health_facilities"));
    $('#filter-facilities').text(odkCommon.localizeText(locale, "filter_health_facilities_by_type"));
    $('#view-all-refrigerators').text(odkCommon.localizeText(locale, "view_all_refrigerators"));
    $('#view-service-refrigerators').text(odkCommon.localizeText(locale, "view_all_refrigerators_needing_service"));
    $('#view-models').text(odkCommon.localizeText(locale, "view_refrigerator_models"));

    var linkedRegion = util.getQueryParameter(util.adminRegion);
    var linkedRegionId = util.getQueryParameter(util.adminRegionId);

    if (linkedRegion !== null) {
        $('#header1').text(linkedRegion);
    }

    // Get the breadcrumb
    if (linkedRegionId !== null && linkedRegionId !== undefined) {
        var breadcrumbName = await util.getBreadcrumbRegionName(locale, linkedRegionId, linkedRegion);
        if (breadcrumbName !== null && breadcrumbName !== undefined) {
			$('#breadcrumb1').text(breadcrumbName);
        }
    }

    var viewFacilitiesMapButton = $('#view-facilities-map-new');
        viewFacilitiesMapButton.on('click', function () {
            var uriParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);
            odkTables.launchHTML(
                null,
                'config/tables/health_facilities/html/hFacilities_map.html' + uriParams
            );
        });
    
    var viewFacilitiesListButton = $('#view-facilities-list-new');
    viewFacilitiesListButton.on(
        'click',
        function() {
            var uriParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);
            odkTables.launchHTML(null,'config/tables/health_facilities/html/health_facilities_list.html' + uriParams);
        }
    );

    var filterFacilitiesButton = $('#filter-facilities-new');
    filterFacilitiesButton.on(
        'click',
        function() {
            var filterQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);
            filterQueryParams = filterQueryParams + util.getKeyToAppendToColdChainURL(util.adminRegionName,
                linkedRegion, false);
            odkTables.launchHTML(null,
                'config/assets/filterHealthFacilitiesByType.html' + filterQueryParams);
        }
    );

    var viewRefrigeratorsButton = $('#view-all-refrigerators-new');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            var frigQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);
            odkTables.launchHTML(null,
                'config/tables/refrigerators/html/refrigerators_list.html' + frigQueryParams);
        }
    );

    var viewServiceRefrigeratorsButton = $('#view-service-refrigerators-new');
    viewServiceRefrigeratorsButton.on(
        'click',
        function() {
            var serviceQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);
			console.log(serviceQueryParams);
            odkTables.launchHTML(null,
                'config/tables/refrigerators/html/refrigerators_service_list.html' + serviceQueryParams);
    });

    var viewColdRoomsButton = $('#view-all-cold-rooms-new');
    viewColdRoomsButton.on(
        'click',
        function() {
            var crQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);
            odkTables.launchHTML(null,
                'config/tables/cold_rooms/html/cold_rooms_list.html' + crQueryParams);
        }
    );

    var viewServiceColdRoomsButton = $('#view-service-cold-rooms-new');
    viewServiceColdRoomsButton.on(
        'click',
        function() {
            var serviceQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);

            odkTables.launchHTML(null,
                'config/tables/cold_rooms/html/cold_rooms_service_list.html' + serviceQueryParams);
        });

    var viewRefrigeratorModelsButton = $('#view-models-new');
    viewRefrigeratorModelsButton.on(
        'click',
        function() {
            odkTables.openTableToListView(null,
                'refrigerator_types',
                '_sync_state != ?',
                [util.deletedSyncState],
                'config/tables/refrigerator_types/html/refrigerator_types_list.html');
        }
    );

}

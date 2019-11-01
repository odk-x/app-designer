/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables, util */

var adminRegionQueryStr = 'admin_region_id = ? AND _sync_state != ?';

async function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var locale = odkCommon.getPreferredLocale();
    $('#view-facilities').text(odkCommon.localizeText(locale, "view_all_health_facilities"));
    $('#filter-facilities').text(odkCommon.localizeText(locale, "filter_health_facilities_by_type"));
    $('#view-all-refrigerators').text(odkCommon.localizeText(locale, "view_all_refrigerators"));
    $('#view-service-refrigerators').text(odkCommon.localizeText(locale, "view_all_refrigerators_needing_service"));
    $('#view-models').text(odkCommon.localizeText(locale, "view_refrigerator_models"));

    var hdrDiv = $('#navHeader');
    var hdr1 = $('<h1>');
    hdr1.attr('id', 'header1');
    hdrDiv.append(hdr1);

    var linkedRegion = util.getQueryParameter(util.adminRegion);
    var linkedRegionId = util.getQueryParameter(util.adminRegionId);

    if (linkedRegion !== null) {
        hdr1.text(linkedRegion);
    }

    // Get the breadcrumb
    if (linkedRegionId !== null && linkedRegionId !== undefined) {
        var breadcrumbName = await util.getBreadcrumbRegionName(locale, linkedRegionId, linkedRegion);
        if (breadcrumbName !== null && breadcrumbName !== undefined) {
            var bcHdr = $('<h4>');
            bcHdr.attr('id', 'breadcrumbHeader');
            bcHdr.text(breadcrumbName);
            hdrDiv.append(bcHdr);
        }
    }


    var viewFacilitiesButton = $('#view-facilities');
    viewFacilitiesButton.on(
        'click',
        function() {
            var uriParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);
             odkTables.openTableToMapView(null, 'health_facilities',
                adminRegionQueryStr, [linkedRegionId, util.deletedSyncState],
                 'config/tables/health_facilities/html/hFacilities_list.html' + uriParams);
        }
    );

    var filterFacilitiesButton = $('#filter-facilities');
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

    var viewRefrigeratorsButton = $('#view-all-refrigerators');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            var frigQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);
            odkTables.launchHTML(null,
                'config/tables/refrigerators/html/refrigerators_list.html' + frigQueryParams);
        }
    );

    var viewServiceRefrigeratorsButton = $('#view-service-refrigerators');
    viewServiceRefrigeratorsButton.on(
        'click',
        function() {
            var serviceQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);

            odkTables.launchHTML(null,
                'config/tables/refrigerators/html/refrigerators_service_list.html' + serviceQueryParams);
    });

    var viewColdRoomsButton = $('#view-all-cold-rooms');
    viewColdRoomsButton.on(
        'click',
        function() {
            var crQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);
            odkTables.launchHTML(null,
                'config/tables/cold_rooms/html/cold_rooms_list.html' + crQueryParams);
        }
    );

    var viewServiceColdRoomsButton = $('#view-service-cold-rooms');
    viewServiceColdRoomsButton.on(
        'click',
        function() {
            var serviceQueryParams = util.getKeyToAppendToColdChainURL(util.adminRegionId, linkedRegionId);

            odkTables.launchHTML(null,
                'config/tables/cold_rooms/html/cold_rooms_service_list.html' + serviceQueryParams);
        });

    var viewRefrigeratorModelsButton = $('#view-models');
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

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

    var hdr1 = $('#header1');
    var leaf = util.getQueryParameter(util.leafRegion);
    if (leaf !== null) {
        hdr1.text(leaf);
    }

    var viewFacilitiesButton = $('#view-facilities');
    viewFacilitiesButton.on(
        'click',
        function() {
            var uriParams = util.getKeysToAppendToColdChainURL(null, null, leaf, null);
             odkTables.openTableToMapView(null, 'health_facility', 
                adminRegionQueryStr, [leaf], 'config/tables/health_facility/html/hFacility_list.html' + uriParams);
        }
    );

    var filterFacilitiesButton = $('#filter-facilities');
    filterFacilitiesButton.on(
        'click',
        function() {
            var filterQueryParams = util.getKeyToAppendToColdChainURL(util.leafRegion, leaf);
            odkTables.launchHTML(null, 
                'config/assets/filterHealthFacilitiesByRegType.html' + filterQueryParams);
        }
    );

    var viewRefrigeratorsButton = $('#view-all-refrigerators');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            var frigQueryParams = util.getKeyToAppendToColdChainURL(util.leafRegion, leaf);
            odkTables.launchHTML(null, 
                'config/tables/refrigerators/html/refrigerators_list.html' + frigQueryParams);
        }
    );

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

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
    var dist = util.getQueryParameter(util.district);
    if (dist !== null) {
        hdr1.text(dist);
    }

    var viewFacilitiesButton = $('#view-facilities');
    viewFacilitiesButton.on(
        'click',
        function() {
             odkTables.openTableToMapView(null, 'health_facility', 
                adminRegionQueryStr, [dist], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewRefrigeratorsButton = $('#view-all-refrigerators');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.openTableToListView(null,
                'refrigerators',
                adminRegionQueryStr,
                [dist],
                'config/tables/refrigerator_types/html/refrigerator_types_list.html');
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

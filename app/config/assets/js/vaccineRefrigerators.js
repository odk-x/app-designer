/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var viewFacilitiesButton = $('#view-facilities');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToListView(
                'health_facility',
                null,
                null,
                'config/tables/health_facility/html/health_facility_list.html');
        }
    );

    var viewRefrigeratorsButton = $('#view-refrigerators');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.openTableToListView(
                'refrigerators',
                null,
                null,
                'config/tables/refrigerators/html/refrigerators_list.html');
        }
    );

    var viewRefrigeratorTypesButton = $('#view-types');
    viewRefrigeratorTypesButton.on(
        'click',
        function() {
            odkTables.openTableToListView(
                'refrigerator_types',
                null,
                null,
                'config/tables/refrigerator_types/html/refrigerator_types_list.html');
        }
    );

}

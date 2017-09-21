/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var viewFacilitiesButton = $('#filter-facilities-by-reg-type');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,'config/assets/filterHealthFacilitiesByRegType.html');
        }
    );

    var viewRefrigeratorsButton = $('#search-facilities-by-name-id');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,'config/tables/health_facility/html/health_facility_list.html');
        }
    );

}

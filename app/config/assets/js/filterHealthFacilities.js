/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var viewFacilitiesButton = $('#filter-facilities-by-geo');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.launchHTML('config/assets/filterHealthFacilitiesByGeo.html');
        }
    );

    var viewRefrigeratorsButton = $('#filter-facilities-by-type');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.launchHTML('config/assets/filterHealthFacilitiesByType.html');
        }
    );

}

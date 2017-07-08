/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var viewFacilitiesButton = $('#frig-inventory-by-age');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,'config/assets/filterFrigInventoryForAge.html');
        }
    );

    var viewRefrigeratorsButton = $('#facility-inventory-by-grid-power');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,'config/assets/filterFacilityInventoryForGridPower.html');
        }
    );

}

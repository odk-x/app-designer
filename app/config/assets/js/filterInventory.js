/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var locale = odkCommon.getPreferredLocale();
    $('#inventory').text(odkCommon.localizeText(locale, "inventory"));
    $('#frig-inventory-by-age').text(odkCommon.localizeText(locale, "refrigerator_age"));
    $('#facility-inventory-by-grid-power').text(odkCommon.localizeText(locale, "facility_grid_power_available"));

    var viewRefrigeratorsButton = $('#frig-inventory-by-age');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,'config/assets/filterFrigInventoryForAge.html');
        }
    );

    var viewFacilitiesButton = $('#facility-inventory-by-grid-power');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,'config/assets/filterFacilityInventoryForGridPower.html');
        }
    );

}

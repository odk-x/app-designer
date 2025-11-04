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
    $('#view-service-refrigerators').text(odkCommon.localizeText(locale, "view_all_refrigerators_needing_service"));

    var viewRefrigeratorsButton = $('#frig-inventory-by-age');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,'config/assets/filterFrigInventoryForAge.html');
        }
    );
	
	var viewServiceRefrigeratorsButton = $('#view-service-refrigerators-new');
    viewServiceRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,
                'config/tables/refrigerators/html/refrigerators_service_list.html');
    });



    var viewFacilitiesButton = $('#facility-inventory-by-grid-power');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,'config/assets/filterFacilityInventoryForGridPower.html');
        }
    );
	
	var viewServiceColdRoomsButton = $('#view-service-cold-rooms');
    viewServiceColdRoomsButton.on(
        'click',
        function() {

            odkTables.launchHTML(null,
                'config/tables/cold_rooms/html/cold_rooms_service_list.html');
        });



}

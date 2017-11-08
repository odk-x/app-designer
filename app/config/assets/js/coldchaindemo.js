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
    $('#admin-opts').text(odkCommon.localizeText(locale, "administrator_options"));
    $('#view-facilities').text(odkCommon.localizeText(locale, "view_health_facilities"));
    $('#view-refrigerators').text(odkCommon.localizeText(locale, "view_inventory"));
    $('#view-models').text(odkCommon.localizeText(locale, "view_refrigerator_models"));
    $('#add-facility').text(odkCommon.localizeText(locale, "add_health_facility"));

    var viewFacilitiesButton = $('#view-facilities');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,'config/assets/filterHealthFacilities.html');
        }
    );

    var viewRefrigeratorsButton = $('#view-refrigerators');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.launchHTML(null,'config/assets/filterInventory.html');
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

    var addFacilityButton = $('#add-facility');
    addFacilityButton.on(
        'click',
        function() {
            odkTables.launchHTML(null, 'config/assets/addHealthFacility.html');
        }
    );

}

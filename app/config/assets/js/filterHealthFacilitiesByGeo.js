/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */
var tableId = 'health_facility';

function display() {

    var viewFacilitiesButton = $('#filter-facilities-by-north');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'regionLevel2 = ?', ['North'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewRefrigeratorsButton = $('#filter-facilities-by-cwest');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'regionLevel2 = ?', ['Central West'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewRefrigeratorsButton = $('#filter-facilities-by-ceast');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'regionLevel2 = ?', ['Central East'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewRefrigeratorsButton = $('#filter-facilities-by-swest');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'regionLevel2 = ?', ['South West'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewRefrigeratorsButton = $('#filter-facilities-by-seast');
    viewRefrigeratorsButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'regionLevel2 = ?', ['South East'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

}

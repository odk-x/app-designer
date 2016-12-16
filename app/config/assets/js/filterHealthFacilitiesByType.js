/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

var tableId = 'health_facility';
function display() {

    var viewFacilitiesButton = $('#filter-facilities-by-central-hospital');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['central_hospital'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewFacilitiesButton = $('#filter-facilities-by-comm-hospital');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['community_hospital'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewFacilitiesButton = $('#filter-facilities-by-dispensary');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['dispensary'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewFacilitiesButton = $('#filter-facilities-by-district-hospital');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['district_hospital'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewFacilitiesButton = $('#filter-facilities-by-dist-vacc-store');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['district_vaccine_store'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewFacilitiesButton = $('#filter-facilities-by-health-center');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['health_center'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewFacilitiesButton = $('#filter-facilities-by-health-post');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['health_post'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewFacilitiesButton = $('#filter-facilities-by-hostpital');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['hospital'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewFacilitiesButton = $('#filter-facilities-by-nat-vacc-store');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['national_vaccine_store'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewFacilitiesButton = $('#filter-facilities-by-reg-vacc-store');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['regional_vaccine_store'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

    var viewFacilitiesButton = $('#filter-facilities-by-rural-hospital');
    viewFacilitiesButton.on(
        'click',
        function() {
            odkTables.openTableToMapView(tableId, 'facility_type = ?', ['rural_hospital'], 'config/tables/health_facility/html/hFacility_list.html');
        }
    );

}

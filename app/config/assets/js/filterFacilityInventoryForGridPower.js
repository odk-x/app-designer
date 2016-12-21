/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */
var noOptionSelectString = "none";
var regionQueryString = 'regionLevel2 = ?';
var typeQueryString = 'facility_type = ?';

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var filterFacilitiesButton = $('#filter-facilities-by-region-type');
    filterFacilitiesButton.on(
        'click',
        function() {
            // Get the value of the type
            var facilityType = $("#facility_type").val();

            // Get the value of the region
            var facilityRegion = $("#facility_region").val();

            var queryParam = util.getKeysToAppendToColdChainURL(facilityType, facilityRegion, null);

            //odkTables.openTableToMapView('health_facility', selection, selectionArgs, 'config/tables/health_facility/html/hFacility_list.html');
            odkTables.launchHTML('config/assets/graphFacilityInventoryForGridPower.html' + queryParam);
        }
    );
}

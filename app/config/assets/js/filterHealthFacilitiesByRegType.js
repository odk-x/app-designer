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
            var selection = null;
            var selectionArgs = null;

            // Get the value of the type
            var facilityType = $("#facility_type").val();
            if (facilityType !== noOptionSelectString) {
                selection = typeQueryString;
                selectionArgs = [];
                selectionArgs.push(facilityType);
            }

            // Get the value of the region
            var facilityRegion = $("#facility_region").val();
            if (facilityRegion !== noOptionSelectString) {
                if (selection === null) {
                    selection = regionQueryString;
                } else {
                    selection += ' AND ' + regionQueryString;
                }

                if (selectionArgs === null) {
                    selectionArgs = [];
                }

                selectionArgs.push(facilityRegion);
            }

SELECT * FROM refrigerators JOIN health_facility ON refrigerators.facility_row_id = health_facility._id JOIN refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id WHERE health_facility.admin_region = ?
            odkTables.openTableToMapView(null, 'health_facility', selection, selectionArgs, 'config/tables/health_facility/html/hFacility_list.html');
        }
    );
}

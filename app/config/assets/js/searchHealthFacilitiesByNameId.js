/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

var tableId = 'health_facility';

var noOptionSelectString = "none";
var facilityNameQueryString = 'facility_name = ?';
var facilityIdQueryString = 'facility_id = ?';
var facilityNameString = 'facility_name';
var facilityIdString = 'facility_id';

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var searchFacilitiesButton = $('#search-facilities-by-name-id');
    searchFacilitiesButton.on(
        'click',
        function() {
            var selection = null;
            var selectionArgs = null;

            // Get the value of the type and text
            var searchType = $("#search_type").val();
            var searchText = $("#search_text").val();
            if (searchType !== noOptionSelectString &&
                searchText !== null && searchText !== undefined) {
                    selectionArgs = [];
                if (searchType === facilityNameString) {
                    selection = facilityNameQueryString;
                } else if (searchType === facilityIdString) {
                    selection = facilityIdQueryString;
                }
                selectionArgs.push(searchText);
            }

            odkTables.openTableToListView('health_facility', selection, selectionArgs, 'config/tables/health_facility/html/health_facility_list.html');
        }
    );

}

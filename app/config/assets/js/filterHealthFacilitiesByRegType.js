/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables, util */

var adminRegionAndTypeQueryStr = 'admin_region = ? AND facility_type = ?';
var leafRegionValue = null;

function showFacilityTypeButton(facilityType, facilityTypeCount) {
    var button = $('<button>');
    button.attr('class', 'button');
    var buttonTxt = util.formatDisplayText(facilityType) + ' (' +
        facilityTypeCount + ')';

    button.text(buttonTxt);

    button.on('click', function () {
        odkTables.openTableToMapView(null, 'health_facility', 
            adminRegionAndTypeQueryStr, [leafRegionValue, facilityType], 
            'config/tables/health_facility/html/hFacility_list.html');
    });
    
    
    $('#buttonsDiv').append(button);
}

function successCB(result) {
    for (var i = 0;  i < result.getCount(); i++) {
        var facilityType = result.getData(i, 'facility_type');
        var facilityTypeCount = result.getData(i, 'count(*)');

        showFacilityTypeButton(facilityType, facilityTypeCount);   
    }
}

function failCB(error) {
    console.log('filterHealthFacilitiesByRegType: util.getFacilityTypesByDistrict failed: ' + error);
}

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var headerDiv = $('#header');

    leafRegionValue = util.getQueryParameter(util.leafRegion);
    if (leafRegionValue !== null) {
        headerDiv.text(leafRegionValue);
    }

    util.getFacilityTypesByDistrict(leafRegionValue, successCB, failCB);
}

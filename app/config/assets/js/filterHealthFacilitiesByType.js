/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables, util */

var queryStr = 'facility_type = ?';
var adminRegionQueryStr = ' AND admin_region_id = ?';
var leafRegionValue = null;
var tableId = 'health_facilities';

function showFacilityTypeButton(facilityType, facilityTypeCount) {
    var button = $('<button>');
    button.attr('class', 'button');

    // Translate facilityType to the appropriate language
    var locale = odkCommon.getPreferredLocale();
    var facTxt = odkCommon.localizeText(locale, facilityType);

    var buttonTxt = facTxt + ' (' +
        facilityTypeCount + ')';

    button.text(buttonTxt);

    button.on('click', function () {
        var queryParams = [facilityType];

        if (leafRegionValue !== null) {
            queryParams = [facilityType, leafRegionValue];
        }

        var uriParams = util.getKeysToAppendToColdChainURL(facilityType, null, leafRegionValue, null);
        odkTables.openTableToMapView(null, tableId,
            queryStr, queryParams,
            'config/tables/health_facilities/html/hFacilities_list.html' + uriParams );
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
    console.log('filterHealthFacilitiesByType: util.getFacilityTypesByAdminRegion failed: ' + error);
}

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var headerDiv = $('#header');

    leafRegionValue = util.getQueryParameter(util.adminRegionId);
    var leafRegionName = util.getQueryParameter(util.adminRegionName);
    if (leafRegionValue !== null && leafRegionValue !== undefined) {
        if (leafRegionName !== null && leafRegionName !== undefined) {
            headerDiv.text(leafRegionName);
        } else {
            headerDiv.text(leafRegionValue);
        }
        queryStr = queryStr + adminRegionQueryStr;
    } else {
        headerDiv.text(util.formatDisplayText(tableId));
    }

    util.getFacilityTypesByAdminRegion(leafRegionValue, successCB, failCB);
}

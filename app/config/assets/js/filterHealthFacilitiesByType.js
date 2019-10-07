/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables, util */

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

        var uriParams = util.getKeysToAppendToColdChainURL(facilityType, null, null, null, leafRegionValue);
        odkTables.launchHTML(null,'config/tables/health_facilities/html/health_facilities_list.html' + uriParams);
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

    } else {
        headerDiv.text(util.formatDisplayText(tableId));
    }

    util.getFacilityTypesByAdminRegion(leafRegionValue, successCB, failCB);
}

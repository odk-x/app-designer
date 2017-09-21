/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/hallway.jpg)');

    var addFacilitiesButton = $('#add-facility');
    addFacilitiesButton.on(
        'click',
        function() {
            var selectedElem = $('#facility_region option:selected');
            var regionLevel1 = $('#facility_region option:selected').attr('data-regionLevel1');
            var regionLevel2 = $('#facility_region option:selected').val();
            var groupReadOnly = 'GROUP_REGION_' + regionLevel1.toUpperCase().replace(/ /g, '_');
            var groupModify = 'GROUP_REGION_' + regionLevel2.toUpperCase().replace(/ /g, '_');

            var defaults = {};
            defaults['regionLevel1'] = regionLevel1;
            defaults['regionLevel2'] = regionLevel2;
            defaults['_group_read_only'] = groupReadOnly;
            defaults['_group_modify'] = groupModify;
            defaults['_group_privileged'] = 'GROUP_ADMIN';
            odkTables.addRowWithSurvey(null, 'health_facility', 'health_facility', null, defaults);
        }
    );
}

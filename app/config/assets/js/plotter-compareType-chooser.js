/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

function display() {

    var body = $('#main');
    var compareTypeStr = null;
    // Set the background to be a picture.
    body.css('background-image', 'url(img/Agriculture_in_Malawi_by_Joachim_Huber_CClicense.jpg)');

    var viewPlantTypeButton = $('#view-plant-type');
    viewPlantTypeButton.on(
        'click',
        function() {
            compareTypeStr = 'plant_type';
            var compareTypeQueryParam = '?compareType=' + encodeURIComponent(compareTypeStr);
            odkTables.launchHTML('config/assets/plotter-comparison-chooser.html' + compareTypeQueryParam);
        }
    );

    var viewSoilButton = $('#view-soil');
    viewSoilButton.on(
        'click',
        function() {
            compareTypeStr = 'soil';
            var compareTypeQueryParam = '?compareType=' + encodeURIComponent(compareTypeStr);
            odkTables.launchHTML('config/assets/plotter-comparison-chooser.html' + compareTypeQueryParam);
        }
    );

}

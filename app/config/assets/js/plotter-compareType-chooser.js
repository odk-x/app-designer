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
            var queryParam = makeQueryParam(compareTypeStr);
            odkTables.launchHTML('config/assets/plotter-comparison-chooser.html' + queryParam);
        }
    );

    var viewSoilButton = $('#view-soil');
    viewSoilButton.on(
        'click',
        function() {
            compareTypeStr = 'soil';
            var queryParam = makeQueryParam(compareTypeStr);
            odkTables.launchHTML('config/assets/plotter-comparison-chooser.html' + queryParam);
        }
    );

}

function makeQueryParam(compareTypeStr) {
    var originPlotId = util.getQueryParameter('plotId');

    var queryParam = '?compareType=' + encodeURIComponent(compareTypeStr);
    if(originPlotId !== null) {
        queryParam += '&plotId=' + encodeURIComponent(originPlotId);
    }

    return queryParam;
}
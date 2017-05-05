/* global $, odkTables, util */
/* exported display */
'use strict';

/**
 * Responsible for rendering the home screen.
 */
function display() {

    var body = $('#main');
    var compareTypeStr = null;
    var queryParam = null;

    // Set the background to be a picture.
    body.css('background-image', 'url(img/Agriculture_in_Malawi_by_Joachim_Huber_CClicense.jpg)');


    var viewPlantTypeButton = $('#view-plant-type');
    viewPlantTypeButton.on(
        'click',
        function() {
            compareTypeStr = 'plant_type';
            queryParam = makeQueryParam(compareTypeStr);
            odkTables.launchHTML(null, 'config/assets/plotter-comparison-chooser.html' + queryParam);
        }
    );

    var viewSoilButton = $('#view-soil');
    viewSoilButton.on(
        'click',
        function() {
            compareTypeStr = 'soil';
            queryParam = makeQueryParam(compareTypeStr);
            odkTables.launchHTML(null, 'config/assets/plotter-comparison-chooser.html' + queryParam);
        }
    );

    var viewAllButton = $('#view-all');
    viewAllButton.on(
        'click',
        function() {
            var originPlotId = util.getQueryParameter('plotId');
            queryParam = '?plotId=' + encodeURIComponent(originPlotId);
            odkTables.launchHTML(null, 'config/assets/plotter-comparison-histogram.html' + queryParam);
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
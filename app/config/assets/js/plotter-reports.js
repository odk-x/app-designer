/* global $, odkTables */
/* exported display */
'use strict';

/**
 * Responsible for rendering the home screen.
 */
function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/Agriculture_in_Malawi_by_Joachim_Huber_CClicense.jpg)');

    var viewOverallButton = $('#view-overall');
    viewOverallButton.on(
        'click',
        function() {
            odkTables.launchHTML(null, 'config/assets/plotter-overall-reports.html');
        }
    );

    var viewSingleButton = $('#view-single');
    viewSingleButton.on(
        'click',
        function() {
            odkTables.launchHTML(null, 'config/assets/plotter-single-reports-chooser.html');
        }
    );

    var viewComparisonButton = $('#view-comparison');
    viewComparisonButton.on(
        'click',
        function() {
            odkTables.launchHTML(null, 'config/assets/plotter-compareType-chooser.html');
        }
    );

}

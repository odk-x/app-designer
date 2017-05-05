/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/Agriculture_in_Malawi_by_Joachim_Huber_CClicense.jpg)');

    var viewOverallButton = $('#view-overall');
    viewOverallButton.on(
        'click',
        function() {
            odkTables.launchHTML('plotter-overall-reports result', 'config/assets/plotter-overall-reports.html');
        }
    );

    var viewSingleButton = $('#view-single');
    viewSingleButton.on(
        'click',
        function() {
            odkTables.launchHTML('plotter-single-reports-chooser result', 'config/assets/plotter-single-reports-chooser.html');
        }
    );

    var viewComparisonButton = $('#view-comparison');
    viewComparisonButton.on(
        'click',
        function() {
            odkTables.launchHTML('plotter-compareType-chooser result', 'config/assets/plotter-compareType-chooser.html');
        }
    );

}

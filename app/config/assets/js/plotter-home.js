/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/Agriculture_in_Malawi_by_Joachim_Huber_CClicense.jpg)');

    var viewPlotsButton = $('#view-plots');
    viewPlotsButton.on(
        'click',
        function() {
            odkTables.openTable(
                'plot',
                null,
                null);
        }
    );

    var viewVisitsButton = $('#view-visits');
    viewVisitsButton.on(
        'click',
        function() {
            odkTables.openTableToListView(
                'visit',
                null,
                null,
                'config/tables/visit/html/visit_list.html');
        }
    );

    var viewReportsButton = $('#view-reports');
    viewReportsButton.on(
        'click',
        function() {
            odkTables.launchHTML('config/assets/plotter-reports.html');
        }
    );

}

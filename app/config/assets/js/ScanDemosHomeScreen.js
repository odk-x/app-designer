/* global control */
'use strict';

function display() {
    $('#immunization-demo-button').on('click', function() {
        control.launchHTML('assets/immunizationDemo.html');
    });

    $('#register-demo-button').on('click', function() {
        control.launchHTML('assets/demoForHivReport.html');
    });
}

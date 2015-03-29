/* global control */
'use strict';

function display() {
    $('#immunization-demo-button').on('click', function() {
        control.launchHTML('config/assets/immunizationDemo.html');
    });

    $('#register-demo-button').on('click', function() {
        control.launchHTML('config/assets/demoForHivReport.html');
    });
}

/* global control */
'use strict';

function display() {
    $('#monthly-summary-button').on('click', function() {
        alert('Not yet implemented');
    });

    $('#follow-up-button').on('click', function() {
        alert('Not yet implemented');
    });

    $('#find-patient-button').on('click', function() {
        control.launchHTML('assets/registerFindPatient.html');
    });
}

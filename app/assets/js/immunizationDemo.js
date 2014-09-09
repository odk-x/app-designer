/* global control */
'use strict';

function display() {
    $('#expected-visits').on('click', function() {
        alert('Not yet implemented');
    });

    $('#follow-up').on('click', function() {
        //alert('Not yet implemented');
        control.launchHTML('assets/immunizationFindFollow-UP.html');
    });
    $('#coverage-rates').on('click', function() {
        control.launchHTML('assets/immunizationCoverageRatesVaccines.html');
    });

    $('#find-record').on('click', function() {
        control.launchHTML('assets/immunizationFindRecord.html');
    });

    $('#kpis-report').on('click', function() {
        control.launchHTML('assets/immunizationCoverageRatesKPIsReportsMonths.html');
    });
}

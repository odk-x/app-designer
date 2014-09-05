/* global control */
'use strict';

function display() {
    $('#hmis-report').on('click', function() {
        control.launchHTML('assets/MonthListForHivPatientReport.html');
    });

    $('#h_ollow-up').on('click', function() {
        control.launchHTML('assets/findHivPatientForFollow-UP.html');
    });
    $('#search').on('click', function() {
       control.launchHTML('assets/findRecordForHivPatient.html');
    });
    $('#filter').on('click', function() {
       control.launchHTML('assets/filteringHivPatient.html');
    });
}

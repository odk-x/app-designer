/* global control
    this file attaches event to respective button like HMIs Report, Follow UP, Search and Filter
*/
'use strict';

function display() {
    $('#hmis-report').on('click', function() {
        var url = control.getFileAsUrl('assets/MonthListForHivPatientReport.html');
        window.location.href = url;
    });

    $('#h_ollow-up').on('click', function() {
        var url = control.getFileAsUrl('assets/findHivPatientForFollow-UP.html');
        window.location.href = url;
    });
    $('#search').on('click', function() {
        var url = control.getFileAsUrl('assets/findRecordForHivPatient.html');
        window.location.href = url;
    });
    $('#filter').on('click', function() {
       var url = control.getFileAsUrl('assets/filteringHivPatient.html');
       window.location.href = url;
    });
}

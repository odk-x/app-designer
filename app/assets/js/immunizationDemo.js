/* global control
    attaching click event for each button on immunizationDemo.html page
*/
'use strict';

function display() {
    $('#expected-visits').on('click', function() {
        alert('Not yet implemented');
    });

    $('#follow-up').on('click', function() {
        var url = control.getFileAsUrl('assets/immunizationFindFollow-UP.html');
        window.location.href = url;
        
    });
    
    $('#coverage-rates').on('click', function() {
        var url = control.getFileAsUrl('assets/immunizationCoverageRatesVaccines.html');
        window.location.href = url;
    });

    $('#find-record').on('click', function() {
        var url = control.getFileAsUrl('assets/immunizationFindRecord.html');
        window.location.href = url;
        
    });

    $('#kpis-report').on('click', function() {
        var url = control.getFileAsUrl('assets/immunizationCoverageRatesKPIsReportsMonths.html');
        window.location.href = url;
       
    });
}

/* global control
    Attaching click event for each month on immunizationCoverageRatesKPIsReportMonths.html.
    For this demo every month is gonna direct to the same KPIs report
*/
'use strict';

function display() {
    $('#april').on('click', function() {
        var url = control.getFileAsUrl('assets/immunizationFindKPIsReport.html');
        window.location.href = url;
    });
    $('#may').on('click', function() {
        var url = control.getFileAsUrl('assets/immunizationFindKPIsReport.html');
        window.location.href = url;
    });
    $('#june').on('click', function() {
       var url = control.getFileAsUrl('assets/immunizationFindKPIsReport.html');
       window.location.href = url;
    });
    $('#july').on('click', function() {
        var url = control.getFileAsUrl('assets/immunizationFindKPIsReport.html');
        window.location.href = url;
    });
    $('#august').on('click', function() {
        var url = control.getFileAsUrl('assets/immunizationFindKPIsReport.html');
        window.location.href = url;
    });
    $('#september').on('click', function() {
        var url = control.getFileAsUrl('assets/immunizationFindKPIsReport.html');
        window.location.href = url;
    });
}

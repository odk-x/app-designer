/* global control
  this file attaches event to the each month in term of button
  for now each button directs to the smae report
*/
'use strict';

function display() {
    $('#april').on('click', function() {
      var url = control.getFileAsUrl('assets/hivPatientSummaryReport.html');
      window.location.href = url;
    });
    $('#may').on('click', function() {
      var url = control.getFileAsUrl('assets/hivPatientSummaryReport.html');
      window.location.href = url;
    });
    $('#june').on('click', function() {
      var url = control.getFileAsUrl('assets/hivPatientSummaryReport.html');
      window.location.href = url;
    });
    $('#july').on('click', function() {
      var url = control.getFileAsUrl('assets/hivPatientSummaryReport.html');
      window.location.href = url;
    });
    $('#august').on('click', function() {
      var url = control.getFileAsUrl('assets/hivPatientSummaryReport.html');
      window.location.href = url;
    });
    $('#september').on('click', function() {
      var url = control.getFileAsUrl('assets/hivPatientSummaryReport.html');
      window.location.href = url;
    });
}

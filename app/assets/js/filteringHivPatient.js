/* global control */
'use strict';
var month;
var age; 
var sex;
var test;
function display() {
    
    $('#begin-search').on('click', function() {
       month = $("#months").val();
       age = $("#ages").val();
       sex = $("#sexs").val();
       test = $("#tests").val();
        var queryString = hiv_scanQueries.getKeyToAppendToURL(month, age, sex, test);
        var url = control.getFileAsUrl('assets/displayFilteringHivPatient.html'+ queryString);
        window.location.href = url;
    });
    
}

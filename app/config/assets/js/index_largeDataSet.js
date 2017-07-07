/* global $, odkTables, odkData, util */
/* exported init */
"use strict";

// Default values provided is user does
// not specify values
var offset = 0;
var limit = 100;
var tableId = 'large_dataset';
var rowCnt = 0;
var os = 'default';
var device = 'default';
var db = 'default';
var services = 'default';
var all1 = 'default';

var init = function() {
    $('#submit').on('click', function() {
        startTest();
    });

    $('#submit').prop('hidden', true);

    // Find out the number of rows that are in the table
    odkData.arbitraryQuery(tableId, "select count(*) from " + tableId, null, null, null, successCB, failureCB);
};

function successCB(result) {

    var tempRowCnt = result.get('count(*)');
    rowCnt = util.verifyIntegerQueryParameterValue(tempRowCnt);

    $('#rowCount').text('Number  of rows in ' + tableId + ' = ' + rowCnt);
    $('#submit').prop('hidden', false);
}

function failureCB(error) {
    console.log("failureCB: arbitraryQuery failed with error: " + error);
}

function startTest() {

    var tempLimit = $('#limit').val();
    var tempValue = util.verifyIntegerQueryParameterValue(tempLimit);
    limit = tempValue === 0 ? limit : tempValue;

    var tempOffset = $('#offset').val();
    offset = util.verifyIntegerQueryParameterValue(tempOffset);

    var tempOS = $('#os').val();
    if (tempOS !== null && tempOS !== undefined) {
        os = tempOS;
    }

    var tempDev = $('#device').val();
    if (tempDev !== null && tempDev !== undefined) {
        device = tempDev;
    }

    var tempDB = $('input[name=db]:checked').val();
    if (tempDB !== null && tempDB !== undefined) {
        db = tempDB;
    }

    var tempServices = $('input[name=services]:checked').val();
    if (tempServices !== null && tempServices !== undefined) {
        services = tempServices;
    }

    var tempAllInOne = $('input[name=all-in-one]:checked').val();
    if (tempAllInOne !== null && tempAllInOne !== undefined) {
        all1 = tempAllInOne;
    }

    odkTables.openTableToListView(null, tableId, null, null,
        'config/tables/' + encodeURIComponent(tableId) + 
		'/html/largeDataSet_list.html?offset=' + encodeURIComponent(offset) +
        '&limit=' + encodeURIComponent(limit) +
        '&count=' + encodeURIComponent(rowCnt) +
        '&os=' + encodeURIComponent(os) +
        '&device=' + encodeURIComponent(device) +
        '&db=' + encodeURIComponent(db) +
        '&services=' + encodeURIComponent(services) +
        '&all1=' + encodeURIComponent(all1));
}

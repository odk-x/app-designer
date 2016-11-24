"use strict";

var offset = 0;
var limit = 100;
var tableId = 'large_dataset';
var rowCnt = 0;

var init = function() {
    $('#submit').on('click', function() {
        startTest();
    });

    $('#submit').prop('hidden', true);

    // Find out the number of rows that are in the table
    odkData.arbitraryQuery(tableId, "select count(*) from " + tableId, null, null, null, successCB, failureCB);
}

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

    odkTables.openTableToListView(tableId, null, null,
        'config/tables/' + tableId+ '/html/largeDataSet_list.html?offset=' + offset +
        '&limit=' + limit + '&count=' + rowCnt);
}

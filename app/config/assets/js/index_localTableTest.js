/* global $, odkData */
/* exported resumeFn */
'use strict';

var test1Table = 'test100';
var test2Table = 'test200';

var updateUITestStatus = function (elemId, text, success) {
    $(elemId).text(text);
  if (success === true) {
      $(elemId).css('color', 'green');
  } else {
      $(elemId).css('color', 'red');
  }
};

var testSingleRow = function() {
    var tableId = test1Table;
    var uiTestElemId = '#outputTestSingleRow';
    var error = '';

    var createTablePromise = new Promise(function(resolve, reject) {
        var colTypeMap = [{'elementKey':'strCol', 'elementName':'strCol', 'elementType':'string', 'listChildElementKeys':'[]'},
                          {'elementKey':'intCol', 'elementName':'intCol', 'elementType':'integer', 'listChildElementKeys':'[]'}];

        odkData.createLocalOnlyTableWithColumns(tableId, colTypeMap, resolve, reject);
    });

    createTablePromise.then(function(result){
        return new Promise (function(resolve, reject) {
            odkData.simpleQueryLocalOnlyTables(tableId, null, null, null, null, null,
                null, null, null, resolve, reject);
        });
    }).then(function(result){
        if (result.getCount() !== 0) {
            error = 'testSingleRow: simpleQueryLocalOnlyTables FAILED: count expected:0 actual:' + result.getCount();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getTableId() !== tableId) {
            error = 'testSingleRow: simpleQueryLocalOnlyTables FAILED: tableId expected: ' + tableId + ' actual:' + result.getTableId();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        return new Promise (function(resolve, reject) {
            var insertColNameValMap = {};
            insertColNameValMap['strCol'] = 'firstString';
            insertColNameValMap['intCol'] = '1';
            odkData.insertLocalOnlyRow(tableId, insertColNameValMap, resolve, reject);
        });

    }).then(function(result){

        return new Promise (function(resolve, reject) {
            odkData.arbitrarySqlQueryLocalOnlyTables(tableId, 'SELECT * FROM L_' + tableId, null, null, null,
            resolve, reject);
        });

    }).then(function(result){
        if (result.getCount() !== 1) {
            error = 'testSingleRow: arbitrarySqlQueryLocalOnlyTables FAILED - count expected:1 actual:' + result.getCount();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.get('strCol') !== 'firstString') {
            error = 'testSingleRow: arbitrarySqlQueryLocalOnlyTables FAILED - strCol expected:firstString actual:' + result.get('strCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.get('intCol') !== '1') {
            error = 'testSingleRow: arbitrarySqlQueryLocalOnlyTables FAILED - intCol expected:1 actual:' + result.get('intCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getTableId() !== tableId) {
            error = 'testSingleRow: arbitrarySqlQueryLocalOnlyTables FAILED: tableId expected: ' + tableId + ' actual:' + result.getTableId();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        return new Promise (function(resolve, reject) {
            var updateColNameValMap = {};
            updateColNameValMap['strCol'] = 'secondString';
            updateColNameValMap['intCol'] = 'secondInteger';
            odkData.updateLocalOnlyRows(tableId, updateColNameValMap, null, null, resolve, reject);
        });

    }).then(function(result){

        return new Promise(function(resolve, reject) {
            odkData.simpleQueryLocalOnlyTables(tableId, null, null, null, null, null,
            null, null, null, resolve, reject);
        });

    }).then(function(result){
        if (result.getCount() !== 1) {
            error = 'testSingleRow: simpleQueryLocalOnlyTables FAILED - count expected:1 actual:' + result.getCount();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.get('strCol') !== 'secondString') {
            error = 'testSingleRow: simpleQueryLocalOnlyTables FAILED - strCol expected:secondString actual:' + result.get('strCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.get('intCol') !== 'secondInteger') {
            error = 'testSingleRow: simpleQueryLocalOnlyTables FAILED - intCol expected:secondInteger actual:' + result.get('intCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getTableId() !== tableId) {
            error = 'testSingleRow: simpleQueryLocalOnlyTables FAILED: tableId expected: ' + tableId + ' actual:' + result.getTableId();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        return new Promise(function(resolve, reject) {
            odkData.deleteLocalOnlyRows(tableId, null, null, resolve, reject);
        });

    }).then  (function(result){

        return new Promise(function(resolve, reject) {
            odkData.arbitrarySqlQueryLocalOnlyTables(tableId, 'SELECT * FROM L_' + tableId, null, null, null,
            resolve, reject);
        });

    }).then (function(result){
        if (result.getTableId() !== tableId) {
            error = 'testSingleRow: arbitrarySqlQueryLocalOnlyTables FAILED: tableId expected: ' + tableId + ' actual:' + result.getTableId();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getCount() !== 0) {
            error = 'testSingleRow: arbitrarySqlQueryLocalOnlyTables FAILED - count expected:0 actual:' + result.getCount();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        return new Promise(function(resolve, reject) {
            odkData.deleteLocalOnlyTable(tableId,
                function(result) {
                    updateUITestStatus(uiTestElemId, 'testSingleRow: Passed', true);
                }, function(errorMsg) {
                    var error = 'testSingleRow: Failed deleteLocalOnlyTable ' + errorMsg;
                    console.log(error);
                    updateUITestStatus(uiTestElemId, error, false);
                }
            );
        });

    }).catch( function(reason) {
        error = 'testSingleRow: Failed with exception ' + reason;
        console.log(error);
        updateUITestStatus(uiTestElemId, error, false);
    });
};

var testMultipleRows = function() {
    var uiTestElemId = '#outputTestMultipleRows';

    var tableId = test2Table;

    var error = '';

    var createTablePromise = new Promise(function(resolve, reject) {
        var colTypeMap = [{'elementKey':'strCol', 'elementName':'strCol', 'elementType':'string', 'listChildElementKeys':'[]'},
                          {'elementKey':'intCol', 'elementName':'intCol', 'elementType':'integer', 'listChildElementKeys':'[]'}];

        odkData.createLocalOnlyTableWithColumns(tableId, colTypeMap, resolve, reject);
    });
    createTablePromise.then(function(result) {
        return new Promise (function(resolve, reject) {
            odkData.simpleQueryLocalOnlyTables(tableId, null, null, null, null, null,
                null, null, null, resolve, reject);
        });

    }).then(function(result){
        if (result.getCount() !== 0) {
            throw 'testMultipleRows: simpleQueryLocalOnlyTables: tableId ' + tableId + ' should have 0 rows';
        }

        if (result.getTableId() !== tableId) {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED: tableId expected: ' + tableId + ' actual:' + result.getTableId();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        return new Promise (function(resolve, reject) {
            var insertColNameValMap = {'strCol':'firstString', 'intCol': '1' };
            odkData.insertLocalOnlyRow(tableId, insertColNameValMap, resolve, reject);
        });

    }).then(function(result){
        new Promise(function(resolve, reject) {
            var insertColNameValMap2 = {'strCol':'secondString', 'intCol': '2' };
            odkData.insertLocalOnlyRow(tableId, insertColNameValMap2, resolve, reject);
        });

    }).then(function(result){
        return new Promise (function(resolve, reject) {
            odkData.arbitrarySqlQueryLocalOnlyTables(tableId, 'SELECT * FROM L_' + tableId, null, null, null,
            resolve, reject);
        });

    }).then(function(result){
        if (result.getCount() !== 2) {
            error = 'testMultipleRows: arbitrarySqlQueryLocalOnlyTables FAILED - count expected:1 actual:' + result.getCount();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(0, 'strCol') !== 'firstString') {
            error = 'testMultipleRows: arbitrarySqlQueryLocalOnlyTables FAILED - strCol expected:firstString actual:' + result.get('strCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(0, 'intCol') !== '1') {
            error = 'testMultipleRows: arbitrarySqlQueryLocalOnlyTables FAILED - intCol expected:1 actual:' + result.get('intCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(1, 'strCol') !== 'secondString') {
            error = 'testMultipleRows: arbitrarySqlQueryLocalOnlyTables FAILED - strCol expected:secondString actual:' + result.get('strCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(1, 'intCol') !== '2') {
            error = 'testMultipleRows: arbitrarySqlQueryLocalOnlyTables FAILED - intCol expected:2 actual:' + result.get('intCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }


        if (result.getTableId() !== tableId) {
            error = 'testMultipleRows: arbitrarySqlQueryLocalOnlyTables FAILED: tableId expected: ' + tableId + ' actual:' + result.getTableId();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        return new Promise (function(resolve, reject) {
            var updateColNameValMap = {};
            updateColNameValMap['strCol'] = 'thirdString';
            updateColNameValMap['intCol'] = '3';
            odkData.updateLocalOnlyRows(tableId, updateColNameValMap, null, null, resolve, reject);
        });

    }).then(function(result){

        return new Promise(function(resolve, reject) {
            odkData.simpleQueryLocalOnlyTables(tableId, null, null, null, null, null,
            null, null, null, resolve, reject);
        });

    }).then(function(result){

        if (result.getCount() !== 2) {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - count expected:2 actual:' + result.getCount();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(0, 'strCol') !== 'thirdString') {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - strCol expected:thirdString actual:' + result.get('strCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(0, 'intCol') !== '3') {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - intCol expected:3 actual:' + result.get('intCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(1, 'strCol') !== 'thirdString') {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - strCol expected:thirdString actual:' + result.get('strCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(1, 'intCol') !== '3') {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - intCol expected:3 actual:' + result.get('intCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getTableId() !== tableId) {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED: tableId expected: ' + tableId + ' actual:' + result.getTableId();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        return new Promise (function(resolve, reject) {
        var insertColNameValMap = {'strCol':'fourthString', 'intCol': '4' };
        odkData.insertLocalOnlyRow(tableId, insertColNameValMap, resolve, reject);
        });

    }).then(function(result){
        return new Promise(function(resolve, reject) {
            odkData.simpleQueryLocalOnlyTables(tableId, null, null, null, null, null,
            null, null, null, resolve, reject);
        });

    }).then(function(result){

        if (result.getCount() !== 3) {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - count expected:3 actual:' + result.getCount();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(0, 'strCol') !== 'thirdString') {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - strCol expected:thirdString actual:' + result.get('strCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(0, 'intCol') !== '3') {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - intCol expected:3 actual:' + result.get('intCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(1, 'strCol') !== 'thirdString') {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - strCol expected:thirdString actual:' + result.get('strCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(1, 'intCol') !== '3') {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - intCol expected:3 actual:' + result.get('intCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(2, 'strCol') !== 'fourthString') {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - strCol expected:fourthString actual:' + result.get('strCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(2, 'intCol') !== '4') {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED - intCol expected:4 actual:' + result.get('intCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getTableId() !== tableId) {
            error = 'testMultipleRows: simpleQueryLocalOnlyTables FAILED: tableId expected: ' + tableId + ' actual:' + result.getTableId();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        return new Promise(function(resolve, reject) {
            odkData.deleteLocalOnlyRows(tableId, 'strCol = ?', ['thirdString'], resolve, reject);
        });

    }).then  (function(result){
        return new Promise(function(resolve, reject) {
            odkData.arbitrarySqlQueryLocalOnlyTables(tableId, 'SELECT * FROM L_' + tableId, null, null, null,
            resolve, reject);
        });

    }).then (function(result){

        if (result.getCount() !== 1) {
            error = 'testMultipleRows: arbitrarySqlQueryLocalOnlyTables FAILED - count expected:1 actual:' + result.getCount();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(0, 'strCol') !== 'fourthString') {
            error = 'testMultipleRows: arbitrarySqlQueryLocalOnlyTables FAILED - strCol expected:fourthString actual:' + result.get('strCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getData(0, 'intCol') !== '4') {
            error = 'testMultipleRows: arbitrarySqlQueryLocalOnlyTables FAILED - intCol expected:4 actual:' + result.get('intCol');
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        if (result.getTableId() !== tableId) {
            error = 'testMultipleRows: arbitrarySqlQueryLocalOnlyTables FAILED: tableId expected: ' + tableId + ' actual:' + result.getTableId();
            updateUITestStatus(uiTestElemId, error, false);
            throw error;
        }

        return new Promise(function(resolve, reject) {
            odkData.deleteLocalOnlyTable(tableId,
                function(result) {
                    updateUITestStatus(uiTestElemId, 'testMultipleRows: Passed', true);
                }, function(errorMsg) {
                    var error = 'testMultipleRows: Failed deleteLocalOnlyTable ' + errorMsg;
                    console.log(error);
                    updateUITestStatus(uiTestElemId, error, false);
                }
            );
        });

    }).catch( function(reason) {
        console.log('Failed to perform testMultipleRows: ' + reason);
    });
};

var cleanupDb = function() {
    var promisesArray = [];

    var getAllLocalTablesQuery = new Promise(function(resolve, reject) {
        odkData.arbitrarySqlQueryLocalOnlyTables('_table_definitions', 'SELECT name FROM sqlite_master WHERE type = ?', ['table'],
            null, null, resolve, reject);
    });

    getAllLocalTablesQuery.then(function(result) {

        for (var i = 0; i < result.getCount(); i++) {
            var tableName = result.getData(i, 'name');
            if (tableName.substr(0, 2) === 'L_') {
                promisesArray.push(new Promise(function(resolve, reject) {
                    odkData.deleteLocalOnlyTable(tableName, resolve, reject);
                }));
            }
        }

        Promise.all(promisesArray).then(function(resultArray) {
            console.log('All local tables cleared');
            testSingleRow();
            testMultipleRows();
        }).catch(function(reason) {
           console.log('Not all tables have been cleared: ' + reason);
        });
    });
};

var resumeFn = function() {
    cleanupDb();
};

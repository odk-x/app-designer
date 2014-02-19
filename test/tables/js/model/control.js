/* global mocha, describe, it, chai */
'use strict';
// We need the data.js file to have been read. This will allow us to
// have access to thins like __getTableData(), which we need in the
// control.query method. So load that script here, synchronously so
// it's available.
$.ajax({
    url: '/app/framework/tables/js/data.js',
    dataType: 'script',
    async: false,
});

$.getScript('/app/framework/tables/js/control.js',
    function() {
        // We'll explicitly alias the window object to control for
        // clarity.
        var control = window.control;

        console.log('called the getscript');
        
        var assert = chai.assert;

        // Now we're going to set our object that will be backing
        // control. Note that we're using $.ajax rather than 
        // $.getScript so that we can perform the callback
        // synchronously.
        $.ajax({
            // Don't use getUrl, bc not in the app folder.
            url: '/test/test_data/control.json',
            success: function(data) {
                var controlObject = data;
                control.setBackingObject(controlObject);
            },
            async: false
        });

        describe('control', function() {

            describe('openTable', function() {
                
                it('#is function', function() {
                    assert.isFunction(control.openTable);
                });

                it('#tableId is object throws', function() {
                    assert.throws(function() {
                        control.openTable({});
                    },
                    'openTable()--tableId not a string');
                });

                it('#sqlWhereClause is object throws', function() {
                    assert.throws(function() {
                        control.openTable('tableId', {}, []);
                    },
                    'openTable()--sqlWhereClause not a string');
                });

                it('#sqlSelection is object throws', function() {
                    assert.throws(function() {
                        control.openTable('tableId', 'selection', {});
                    },
                    'openTable()--sqlSelectionArgs not an array');
                });

                it('#four arguments throws', function() {
                    assert.throws(function() {
                        control.openTable('tableId',
                            'selection',
                            [],
                            'spurious');
                    },
                    'openTable()--too many arguments');
                });

            });

            describe('openTableToListView', function() {
                
                it('#is function', function() {
                    assert.isFunction(control.openTableToListView);
                });

                it('#tableId is object throws', function() {
                    assert.throws(function() {
                        control.openTableToListView({},
                            null, null, null);
                    },
                    'openTableToListView()--tableId not a string');
                });

                it('#sqlWhereClause is object throws', function() {
                    assert.throws(function() {
                        control.openTableToListView(
                            'tableId',
                            {},
                            [],
                            'path');
                    },
                    'openTableToListView()--' +
                    'sqlWhereClause not a string');
                });
                
                it('#sqlSelectionArgs is object throws', function() {
                    assert.throws(function() {
                        control.openTableToListView('tableId',
                            'selection', {}, 'path');
                    },
                    'openTableToListView()--' +
                    'sqlSelectionArgs not an array');
                });

                it('#relativePath is object throws', function() {
                    assert.throws(function() {
                        control.openTableToListView('tableId',
                            'selection', [], {});
                    },
                    'openTableToListView()--' +
                    'relativePath not a string');
                });

                it('#five arguments throws', function() {
                    assert.throws(function() {
                        control.openTableToListView('tableId',
                            null, null, null, null);
                    },
                    'openTableToListView()--too many arguments');
                });

            });

            describe('openTableToMapView', function() {

                it('#is function', function() {
                    assert.isFunction(control.openTableToMapView);
                });

                it('#tableId is object throws', function() {
                    assert.throws(function() {
                        control.openTableToMapView({},
                            null, null, null);
                    },
                    'openTableToMapView()--tableId not a string');
                });

                it('#sqlWhereClause is object throws', function() {
                    assert.throws(function() {
                        control.openTableToMapView(
                            'tableId',
                            {},
                            [],
                            'path');
                    },
                    'openTableToMapView()--' +
                    'sqlWhereClause not a string');
                });
                
                it('#sqlSelectionArgs is object throws', function() {
                    assert.throws(function() {
                        control.openTableToMapView('tableId',
                            'selection', {}, 'path');
                    },
                    'openTableToMapView()--' +
                    'sqlSelectionArgs not an array');
                });

                it('#relativePath is object throws', function() {
                    assert.throws(function() {
                        control.openTableToMapView('tableId',
                            'selection', [], {});
                    },
                    'openTableToMapView()--relativePath not a string');
                });

                it('#five arguments throws', function() {
                    assert.throws(function() {
                        control.openTableToMapView('tableId',
                            null, null, null, null);
                    },
                    'openTableToMapView()--too many arguments');
                });


            });

            describe('openTableToSpreadsheetView', function() {

                it('#is function', function() {
                    assert.isFunction(
                        control.openTableToSpreadsheetView);
                });

                it('#tableId is object throws', function() {
                    assert.throws(function() {
                        control.openTableToSpreadsheetView({},
                            null, null);
                    },
                    'openTableToSpreadsheetView()--' +
                    'tableId not a string');
                });

                it('#sqlWhereClause is object throws', function() {
                    assert.throws(function() {
                        control.openTableToSpreadsheetView(
                            'tableId',
                            {},
                            []);
                    },
                    'openTableToSpreadsheetView()--' +
                    'sqlWhereClause not a string');
                });
                
                it('#sqlSelectionArgs is object throws', function() {
                    assert.throws(function() {
                        control.openTableToSpreadsheetView('tableId',
                            'selection', {});
                    },
                    'openTableToSpreadsheetView()--' +
                    'sqlSelectionArgs not an array');
                });

                it('#four arguments throws', function() {
                    assert.throws(function() {
                        control.openTableToSpreadsheetView(
                            'tableId',
                            null,
                            null,
                            null);
                    },
                    'openTableToSpreadsheetView()--' +
                    'too many arguments');
                });


            });

            describe('query', function() {

                it('#is function', function() {
                    assert.isFunction(control.query);
                });

                it('#tableId is object throws', function() {
                    assert.throws(function() {
                        control.query({}, null, null);
                    },
                    'query()--tableId not a string');
                });
                
                it('#sqlWhereClause is object throws', function() {
                    assert.throws(function() {
                        control.query('tableId', {}, null);
                    },
                    'query()--sqlWhereClause not a string');
                });

                it('#sqlSelectionArgs is object throws', function() {
                    assert.throws(function() {
                        control.query('tableId', 'where', {});
                    },
                    'query()--sqlSelectionArgs not an array');
                });

                it('#four arguments throws', function() {
                    assert.throws(function() {
                        control.query('tableId', 'where', [], null);
                    },
                    'query()--too many arguments');
                });

                it('#getCount is function on result', function() {
                    // We just are testing that we can indeed get a
                    // functional TableData object back. The presence
                    // of that function is how we're testing it. We
                    // don't want to test any real functionality or
                    // returns, because that is really a property of
                    // a functioning data.js, not the control object.
                    var table = control.query(
                        'Tea_houses',
                        null,
                        null);
                    assert.isFunction(table.getCount);
                });

            });

            describe('releaseQueryResources', function() {

                it('#is function', function() {
                    assert.isFunction(control.releaseQueryResources);
                });

                it('#tableId is object throws', function() {
                    assert.throws(function() {
                        control.releaseQueryResources({});
                    },
                    'releaseQueryResources()--tableId not a string');
                });

                it('#two arguments throws', function() {
                    assert.throws(function() {
                        control.releaseQueryResources('id', {});
                    },
                    'releaseQueryResources()--too many arguments');
                });

            });

            describe('getAllTableIds', function() {

                it('#is function', function() {
                    assert.isFunction(control.getAllTableIds);
                });

                it('#result is array', function() {
                    assert.isArray(control.getAllTableIds());
                });

                it('#contains all test table ids', function() {
                    // We have four tables for sure:
                    // Tea_houses, Tea_inventory, Tea_types, and
                    // Tea_houses_editable. There also might be a
                    // framework table, depending on whether or not we
                    // exported the debug objects before or after
                    // running survey. Therefore we're just going to
                    // check for the four sure things.
                    var actual = control.getAllTableIds();
                    assert.include(
                        actual,
                        'Tea_houses',
                        'Tea_houses not included: ' + actual);
                    assert.include(
                        actual,
                        'Tea_inventory',
                        'Tea_inventory not included: ' + actual);
                    assert.include(
                        actual,
                        'Tea_types',
                        'Tea_types not included: ' + actual);
                    assert.include(
                        actual,
                        'Tea_houses_editable',
                        'Tea_houses_editable not included: ' + actual);
                });

            });

            describe('launchHTML', function() {

                it('#is function', function() {
                    assert.isFunction(control.launchHTML);
                });

                it('#tableId is object throws', function() {
                    assert.throws(function() {
                        control.launchHTML({});
                    },
                    'launchHTML()--relativePath not a string');
                });

            });

            describe('openDetailView', function() {

                it('#is function', function() {
                    assert.isFunction(control.openDetailView);
                });

                it('#tableId is object throws', function() {
                    assert.throws(function() {
                        control.openDetailView({}, 'id', 'path');
                    },
                    'openDetailView()--tableId not a string');
                });

                it('#rowId is object throws', function() {
                    assert.throws(function() {
                        control.openDetailView('id', {}, 'path');
                    },
                    'openDetailView()--rowId not a string');
                });

                it('#relativePath is object throws', function() {
                    assert.throws(function() {
                        control.openDetailView('id', 'id', {});
                    },
                    'openDetailView()--relativePath not a string');
                });

            });

            describe('addRowWithCollectDefault', function() {

                it('#is function', function() {
                    assert.isFunction(
                        control.addRowWithCollectDefault);
                });

                it('#tableId is object throws', function() {
                    assert.throws(function() {
                        control.addRowWithCollectDefault({});
                    },
                    'addRowWithCollectDefault()--' +
                    'tableId not a string');
                });

            });

            describe('addRowWithCollect', function() {

                it('#is function', function() {
                    assert.isFunction(control.addRowWithCollect);
                });

            });

            describe('editRowWithCollectDefault', function() {

                it('#is function', function() {
                    assert.isFunction(
                        control.editRowWithCollectDefault);
                });

            });

            describe('editRowWithCollect', function() {

                it('#is function', function() {
                    assert.isFunction(control.editRowWithCollect);
                });

            });

            describe('editRowWithSurveyDefault', function() {

                it('#is function', function() {
                    assert.isFunction(
                        control.editRowWithSurveyDefault);
                });

            });

            describe('editRowWithSurvey', function() {

                it('#is function', function() {
                    assert.isFunction(control.editRowWithSurvey);
                });

            });


            describe('addRowWithSurveyDefault', function() {

                it('#is function', function() {
                    assert.isFunction(control.addRowWithSurveyDefault);
                });

            });

            describe('addRowWithSurvey', function() {

                it('#is function', function() {
                    assert.isFunction(control.addRowWithSurvey);
                });

            });

            describe('getElementKey', function() {

                it('#is function', function() {
                    assert.isFunction(control.getElementKey);
                });

                it('#returns State for Tea_houses.State', function() {
                    var result = control.getElementKey(
                        'Tea_houses',
                        'State');
                    assert.equal(
                        result,
                        'State',
                        'did not match: ' + result);
                });

                it('#returns Price_8oz for Tea_inventory.Price_8oz',
                    function() {
                    var result = control.getElementKey(
                        'Tea_inventory',
                        'Price_8oz');
                    assert.equal(
                        result,
                        'Price_8oz',
                        'did not match: ' + result);
                });

                it('#returns Type_id for Tea_types.Type_id',
                    function() {
                    var result = control.getElementKey(
                        'Tea_types',
                        'Type_id');
                    assert.equal(
                        result,
                        'Type_id',
                        'did not match: ' + result);
                });

                it('#key from unknown table returns undefined',
                        function() {
                    // Note that, at least on the 4.3 samsung galaxy s3
                    // implementation, a 'null' return value gets passed into the
                    // javascript as undefined, it seems.
                    var result = control.getElementKey(
                        'Fake_table',
                        'fake_path');
                    assert.isUndefined(result, 'was not undefined');
                });

            });

            describe('getColumnDisplayName', function() {

                it('#is function', function() {
                    assert.isFunction(control.getColumnDisplayName);
                });

                it('#returns State for Tea_houses.State', function() {
                    var result = control.getColumnDisplayName(
                        'Tea_houses',
                        'State');
                    assert.equal(
                        result,
                        'State',
                        'did not match: ' + result);
                });

                it('#returns Price_8oz for Tea_inventory.Price_8oz',
                    function() {
                    var result = control.getColumnDisplayName(
                        'Tea_inventory',
                        'Price_8oz');
                    assert.equal(
                        result,
                        'Price_8oz',
                        'did not match: ' + result);
                });

                it('#returns Type_id for Tea_types.Type_id',
                    function() {
                    var result = control.getColumnDisplayName(
                        'Tea_types',
                        'Type_id');
                    assert.equal(
                        result,
                        'Type_id',
                        'did not match: ' + result);
                });

                it('#key from unknown table returns undefined',
                    function() {
                    var result = control.getColumnDisplayName(
                        'Fake_table',
                        'fake_path');
                    assert.isUndefined(result, 'was not undefined');
                });

                it('#fake key from known table returns undefined',
                    function() {
                    var result = control.getColumnDisplayName(
                        'Tea_houses',
                        'fake_column');
                    assert.isUndefined(result, 'was not undefined');
                });

            });

            describe('getTableDisplayName', function() {

                it('#is function', function() {
                    assert.isFunction(control.getTableDisplayName);
                });

                it('#Tea_houses returns "Tea houses"', function() {
                    var result = control.getTableDisplayName(
                        'Tea_houses');
                    assert.equal(
                        result,
                        'Tea houses',
                        'did not match: ' + result);
                });

                it('#Tea_inventory returns "Tea inventory"',
                    function() {
                    var result = control.getTableDisplayName(
                        'Tea_inventory');
                    assert.equal(
                        result,
                        'Tea inventory',
                        'did not match: ' + result);
                });

                it('#Tea_types returns "Tea types"', function() {
                    var result = control.getTableDisplayName(
                        'Tea_types');
                    assert.equal(
                        result,
                        'Tea types',
                        'did not match: ' + result);
                });


            });

            describe('columnExists', function() {

                it('#is function', function() {
                    assert.isFunction(control.columnExists);
                });
                
                // We're going to request columns from two different
                // tables just so we're sure to test more than a single
                // table.

                it('#Tea_houses.State exists', function() {
                    var result = control.columnExists(
                        'Tea_houses',
                        'State');
                    assert.isTrue(result, 'did not return true');
                });

                it('#Tea_houses.fakeColumn does not exist',
                    function() {
                    var result = control.columnExists(
                        'Tea_houses',
                        'fakeColumn');
                    assert.isFalse(result, 'did not return false');
                });

                it('#Tea_types.Caffeinated exists', function() {
                    var result = control.columnExists(
                        'Tea_types',
                        'Caffeinated');
                    assert.isTrue(result, 'did not return true');
                });

                it('#Tea_types.fakeColumn does not exist',
                    function() {
                    var result = control.columnExists(
                        'Tea_types',
                        'fakeColumn');
                    assert.isFalse(result, 'did not return false');
                });

                it('#Fake table id returns false', function() {
                    var result = control.columnExists(
                        'fake_table',
                        'fakeColumn');
                    assert.isFalse(
                        result,
                        'result was not null: ' + result);
                });

            });

            describe('getFileAsUrl', function() {

                it('#is function', function() {
                    assert.isFunction(control.getFileAsUrl);
                });

            });

            describe('getPlatformInfo', function() {
                // It really doesn't make too much sense to test this,
                // as the one that is returned by the java has nothing
                // to do with the one that is returned when running on
                // chrome.
                it('#is function', function() {
                    assert.isFunction(control.getPlatformInfo);
                });

                var infoStr = control.getPlatformInfo();
                var info = JSON.parse(infoStr);

                it('#returns string', function() {
                    assert.isString(infoStr, 'was not a string');
                });

                it('#can be parsed to object', function() {
                    assert.isObject(info, 'was not object: ' + info);
                });

                it('#has property container', function() {
                    assert.property(info, 'container');
                });

                it('#has property version', function() {
                    assert.property(info, 'version');
                });

                it('#has property appName', function() {
                    assert.property(info, 'appName');
                });

                it('#has property baseUri', function() {
                    assert.property(info, 'baseUri');
                });

                it('#has property logLevel', function() {
                    assert.property(info, 'logLevel');
                });

                it('#container is Chrome', function() {
                    var result = info.container;
                    assert.equal(
                        result,
                        'Chrome',
                        'did not match: ' + result);
                });

                it('#appName is Tables-test', function() {
                    var result = info.appName;
                    assert.equal(
                        result,
                        'Tables-test',
                        'did not match: ' + result);
                });

                it('#baseUri is "http://localhost:8000/app/"',
                    function() {
                    var result = info.baseUri;
                    assert.equal(
                        result,
                        'http://localhost:8000/app/');
                });

                it('#logLevel is D', function() {
                    var result = info.logLevel;
                    assert.equal(
                        result,
                        'D',
                        'did not match: ' + result);
                });


            });
            
        });
        window._filesLoaded++;
        if (window._filesLoaded === window._totalToLoad) {
            mocha.run();
        }
    }
);

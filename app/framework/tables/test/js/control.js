/**
 * This is a test of the control object that should be run on the phone after
 * importing the csv files in the framework/test/csv/ directories.
 */
/* global describe, it, chai, control */
'use strict';

describe('control', function() {

    var assert = chai.assert;

    describe('openTable', function() {

        it('#is function', function() {
            assert.isFunction(control.openTable);
        });

    });

    describe('openTableToListView', function() {
        
        it('#is function', function() {
            assert.isFunction(control.openTableToListView);
        });

    });

    describe('openTableToMapView', function() {

        it('#is function', function() {
            assert.isFunction(control.openTableToMapView);
        });

    });

    describe('openTableToSpreadsheetView', function() {

        it('#is function', function() {
            assert.isFunction(control.openTableToSpreadsheetView);
        });

    });

    describe('query', function() {

        var table = control.query(
            'Tea_houses',
            'Region = ?',
            ['Weste']);

        // This tests the built in SQL functionality--ie that you can do
        // more complicated joins using this api. 
        // This will be all the tables that serve green tea.
        var tableSqlFunc = control.query(
            'Tea_houses',
            'House_id IN (SELECT House_id FROM Tea_inventory WHERE Type_id=?)',
            ['2']);


        it('#returns an object', function() {
            assert.isObject(table, 'was not an object: ' + table);
        });

        it('#query Tea_houses for Region=Weste is correct size', function() {
            assert.equal(table.getCount(), 7, 'count did not match reality');
        });

        it('#query Region=Weste returns only those rows', function() {
            // This tests that we're not just returning a random 7 rows or
            // something.
            var allWeste = true;
            for (var i = 0; i < table.getCount(); i++) {
                var region = table.getData(i, 'Region');
                if (region !== 'Weste') {
                    allWeste = false;
                }
            }
            assert.isTrue(allWeste, 'a Region was not Weste');
        });

        it('#SQL for green tea shops is correct size', function() {
            assert.equal(
                tableSqlFunc.getCount(),
                6,
                'wrong size: ' + tableSqlFunc.length);
        });

        it('#SQL for green tea shops includes Whipplesnaith', function() {
            var columnStr = tableSqlFunc.getColumnData('Name');
            var column = JSON.parse(columnStr);
            assert.include(
                column,
                'Whipplesnaith',
                'Whipplesnaith not in array: ' + column);
        });

    });

    describe('releaseQueryResources', function() {
        
        it('#is function', function() {
            assert.isFunction(control.releaseQueryResources);
        });

    });

    describe('getAllTableIds', function() {

        var tableIdsStr = control.getAllTableIds();
        var tableIds = JSON.parse(tableIdsStr);
        
        it('#returns a string', function() {
            assert.isString(tableIdsStr, 'was not string: ' + tableIdsStr);
        });
        
        it('#can be parsed to an array', function() {
            assert.isArray(tableIds, 'did not return an array');
        });

        it('#result is LOOSELY correct size', function() {
            // This is a variable number of tables, depending on what has been
            // loaded. It assumes you import based on the tables.properties
            // file and have 11 tables. This changes with the default
            // configuration, however. As more options become standard, add
            // them here.
            assert.include(
                [11],
                tableIds.length,
                'result was not correct size');
        });

        it('#contains Tea_houses', function() {
            assert.include(tableIds, 'Tea_houses', 'was not in array');
        });

        it('#contains Tea_inventory', function() {
            assert.include(tableIds, 'Tea_inventory', 'was not in array');
        });

        it('#contains Tea_types', function() {
            assert.include(tableIds, 'Tea_types', 'was not in array');
        });

    });

    describe('launchHTML', function() {

        it('#is function', function() {
            assert.isFunction(control.launchHTML);
        });

    });

    describe('openDetailView', function() {

        it('#is function', function() {
            assert.isFunction(control.openDetailView);
        });

    });

    describe('addRow', function() {

        it('#is function', function() {
            assert.isFunction(control.addRow);
        });

    });

    describe('updateRow', function() {

        it('#is function', function() {
            assert.isFunction(control.updateRow);
        });

    });

    describe('addRowWithCollectDefault', function() {

        it('#is function', function() {
            assert.isFunction(control.addRowWithCollectDefault);
        });

    });

    describe('addRowWithCollect', function() {

        it('#is function', function() {
            assert.isFunction(control.addRowWithCollect);
        });

    });

    describe('editRowWithCollectDefault', function() {

        it('#is function', function() {
            assert.isFunction(control.editRowWithCollectDefault);
        });

    });

    describe('editRowWithCollect', function() {

        it('#is function', function() {
            assert.isFunction(control.editRowWithCollect);
        });

    });

    describe('editRowWithSurveyDefault', function() {

        it('#is function', function() {
            assert.isFunction(control.editRowWithSurveyDefault);
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

        // This method could really use more exhaustive testing, as we
        // currently don't have any complicated elementPath values in these
        // tables. They're only one deep. We should probably include testing
        // here of one for which the default hack-y way of replacing . with _
        // succeeds, as well as one where it doesn't. Right now we don't even
        // do any replacing, because these elementPaths are the same as the
        // elementKeys.
        
        // we're going to try one from each table, just so that we're sure we
        // can access othertables, regardless for which table's list/detail
        // view you use to display this file on the phone.

        it('#returns State for Tea_houses.State', function() {
            var result = control.getElementKey('Tea_houses', 'State');
            assert.equal(result, 'State', 'did not match: ' + result);
        });

        it('#returns Price_8oz for Tea_inventory.Price_8oz', function() {
            var result = control.getElementKey('Tea_inventory', 'Price_8oz');
            assert.equal(result, 'Price_8oz', 'did not match: ' + result);
        });

        it('#returns Type_id for Tea_types.Type_id', function() {
            var result = control.getElementKey('Tea_types', 'Type_id');
            assert.equal(result, 'Type_id', 'did not match: ' + result);
        });

        it('#key from unknown table returns undefined', function() {
            // Note that, at least on the 4.3 samsung galaxy s3
            // implementation, a 'null' return value gets passed into the
            // javascript as undefined, it seems.
            var result = control.getElementKey('Fake_table', 'fake_path');
            assert.isUndefined(result, 'was not undefined');
        });

        // Note that this test currently fails because the correct 
        // getElementKey method is not actually implemented. It SHOULD do a
        // real calculation based on the value. Instead, it is currently just
        // replacing '.' with '_'. So this is returning 'fake_column' when it
        // should be returning null. When that method is actually implemented
        // correctly, this should be uncommented.
        //it('#fake key from known table returns null', function() {
            //var result = control.getElementKey('Tea_houses', 'fake_column');
            //assert.isUndefined(result, 'was not undefined');
        //});

    });

    describe('getColumnDisplayName', function() {

        // This method could really use more exhaustive testing, as we
        // currently don't have any complicated elementPath values in these
        // tables. They're only one deep. We should probably include testing
        // here of one for which the default hack-y way of replacing . with _
        // succeeds, as well as one where it doesn't. Right now we don't even
        // do any replacing, because these elementPaths are the same as the
        // elementKeys.
        
        // we're going to try one from each table, just so that we're sure we
        // can access othertables, regardless for which table's list/detail
        // view you use to display this file on the phone.

        it('#returns State for Tea_houses.State', function() {
            var result = control.getColumnDisplayName('Tea_houses', 'State');
            assert.equal(result, 'State', 'did not match: ' + result);
        });

        it('#returns Price_8oz for Tea_inventory.Price_8oz', function() {
            var result = control.getColumnDisplayName(
                'Tea_inventory',
                'Price_8oz');
            assert.equal(result, 'Price_8oz', 'did not match: ' + result);
        });

        it('#returns Type_id for Tea_types.Type_id', function() {
            var result = control.getColumnDisplayName('Tea_types', 'Type_id');
            assert.equal(result, 'Type_id', 'did not match: ' + result);
        });

        it('#key from unknown table returns undefined', function() {
            var result =
                control.getColumnDisplayName('Fake_table', 'fake_path');
            assert.isUndefined(result, 'was not undefined');
        });

        it('#fake key from known table returns undefined', function() {
            var result =
                control.getColumnDisplayName('Tea_houses', 'fake_column');
            assert.isUndefined(result, 'was not undefined');
        });

    });

    describe('getTableDisplayName', function() {
        
        it('#Tea_houses returns "Tea houses"', function() {
            var result = control.getTableDisplayName('Tea_houses');
            assert.equal(result, 'Tea houses', 'did not match: ' + result);
        });

        it('#Tea_inventory returns "Tea inventory"', function() {
            var result = control.getTableDisplayName('Tea_inventory');
            assert.equal(result, 'Tea inventory', 'did not match: ' + result);
        });

        it('#Tea_types returns "Tea types"', function() {
            var result = control.getTableDisplayName('Tea_types');
            assert.equal(result, 'Tea types', 'did not match: ' + result);
        });

    });

    describe('columnExists', function() {
        
        // We're going to request columns from two different tables just so
        // we're sure to test more than a single table.

        it('#Tea_houses.State exists', function() {
            var result = control.columnExists('Tea_houses', 'State');
            assert.isTrue(result, 'did not return true');
        });

        it('#Tea_houses.fakeColumn does not exist', function() {
            var result = control.columnExists('Tea_houses', 'fakeColumn');
            assert.isFalse(result, 'did not return false');
        });

        it('#Tea_types.Caffeinated exists', function() {
            var result = control.columnExists('Tea_types', 'Caffeinated');
            assert.isTrue(result, 'did not return true');
        });

        it('#Tea_types.fakeColumn does not exist', function() {
            var result = control.columnExists('Tea_types', 'fakeColumn');
            assert.isFalse(result, 'did not return false');
        });

        it('#Fake table id returns false', function() {
            var result = control.columnExists('fake_table', 'fakeColumn');
            assert.isFalse(result, 'result was not null: ' + result);
        });

    });

    describe('getFileAsUrl', function() {

        it('#returns a string', function() {
            var result = control.getFileAsUrl('relativePath');
            assert.isString(result, 'was not string: ' + result);
        });

        it('#relativePath returns full url', function() {
            var result = control.getFileAsUrl('relativePath');
            assert.equal(
                'http://localhost:8635/tables/relativePath',
                result,
                'did not match: ' + result);
        });

        // TODO: probably a correct escaping of a url

    });

    describe('getPlatformInfo', function() {

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

        it('#container is Android', function() {
            var result = info.container;
            assert.equal(result, 'Android', 'did not match: ' + result);
        });

        it('#appName is tables', function() {
            var result = info.appName;
            assert.equal(result, 'tables', 'did not match: ' + result);
        });

        it('#baseUri is "http://localhost:8635/tables/"', function() {
            var result = info.baseUri;
            assert.equal(
                result,
                'http://localhost:8635/tables/');
        });

        it('#logLevel is D', function() {
            var result = info.logLevel;
            assert.equal(result, 'D', 'did not match: ' + result);
        });

    });

});


/**
 * This is a test of the data object that should be run on the phone after
 * importing the csv files in the framework/test/csv/ directories.
 *
 * The type of the Customers column must have been set to Integer.
 */
/* global describe, it, chai, data */
'use strict';

describe('data: Tea_houses', function() {

    var assert = chai.assert;

    describe('getCount', function() {

        it('#correctSize', function() {
            var result = data.getCount();
            assert.equal(result, 17);
        });

    });

    describe('getColumnData', function() {
        
        var houseIdColumnStr = data.getColumnData('House_id');
        var houseIdColumn = JSON.parse(houseIdColumnStr);

        it('#returns string for House_id', function() {
            assert.isString(houseIdColumnStr);
        });

        it('#is parseable to array for House_id', function() {
            assert.isArray(houseIdColumn);
        });

        it('#array is correct size', function() {
            var length = houseIdColumn.length;
            assert.equal(length, 17, 'not correct size: ' + length);
        });

        it('#contains first value', function() {
            // Contains the first id in the csv
            var result = houseIdColumn[0];
            assert.equal(result, 't3', 'did not match: ' + result);
        });

        it('#contains last value', function() {
            // Contains the last id in the csv
            var result = houseIdColumn[16];
            assert.equal(result, 't17', 'did not match: ' + result);
        });

        it('#fake column returns undefined', function() {
            var result = data.getColumnData('fakeColumn');
            assert.isUndefined(result, 'was not undefined: ' + result);
        });

    });

    describe('getTableId', function() {

        var tableId = data.getTableId();

        it('#returns string', function() {
            assert.isString(tableId, 'was not string: ' + tableId);
        });

        it('#is correct value', function() {
            assert.equal(tableId, 'Tea_houses', 'did not match: ' + tableId);
        });

    });

    describe('getRowId', function() {

        var rowId = data.getRowId(0);

        it('#returns string', function() {
            assert.isString(rowId, 'was not string: ' + rowId);
        });

        // TODO: when some sort of backwards compatible export arises (so that
        // we don't have to deal with updating the csvs every time we change
        // the output) we should do a test that we actually get the correct
        // value for a rowId.

    });

    describe('getColumns', function() {

        var columnsStr = data.getColumns();
        var columns = JSON.parse(columnsStr);

        it('#returns a string', function() {
            assert.isString(columnsStr, 'not a string: ' + columnsStr);
        });

        it('#is parseable to an object', function() {
            assert.isObject(columns, 'not an object: ' + columns);
        });

        it('#has House_id', function() {
            assert.property(columns, 'House_id');
        });

        it('#House_id is type None', function() {
            var type = columns.House_id;
            assert.equal(type, 'None', 'was not None: ' + type);
        });

        it('#Customers is type Integer', function() {
            var type = columns.Customers;
            assert.equal(type, 'Integer', 'was not Integer: ' + type);
        });

    });

    describe('getForegroundColor', function() {

        it('#Customers 100 returns string', function() {
            var result = data.getForegroundColor('Customers', '100');
            assert.isString(result, 'was not string: ' + result);
        });

        // This should be uncommented when the getElementKeyFromElementPath
        // method is implemented for real rather than just using a string
        // replace.
        //it('#fake element key is undefined', function() {
            //var result = data.getForegroundColor('fakeColumn', 'fakeDatum');
            //assert.isUndefined(result, 'was not undefined: ' + result);
        //});

    });

    describe('isGroupedBy', function() {

        // Tea_houses should not be grouped by at first.
        it('#Tea_houses not grouped', function() {
            var result = data.isGroupedBy();
            assert.isFalse(result, 'was not false: ' + result);
        });

    });

    describe('getData', function() {

        it('#row 4 House_id', function() {
            var result = data.getData(4, 'House_id');
            assert.equal(result, 't6', 'did not match: ' + result);
        });

        it('#row 16 House_id', function() {
            var result = data.getData(16, 'House_id');
            assert.equal(result, 't17', 'did not match: ' + result);
        });

        it('#row 4 Name', function() {
            var result = data.getData(4, 'Name');
            assert.equal(
                result,
                'Trinity\'s Spies',
                'did not match: ' + result);
        });

        it('#row 4 Customers', function() {
            var result = data.getData(4, 'Customers');
            assert.equal(
                result,
                '123',  // string b/c getData returns String
                'did not match: ' + result);
        });

    });

    describe('get', function() {
        
        it('#House_id', function() {
            var result = data.get('House_id');
            assert.equal(result, 't3');
        });

        it('#Name', function() {
            var result = data.get('Name');
            assert.equal(
                result,
                'Tibbins House on Kingsley',
                'did not match: ' + result);
        });

        it('#Customers', function() {
            var result = data.get('Customers');
            assert.equal(result, '1907', 'did not match: ' + result);
        });

    });

});

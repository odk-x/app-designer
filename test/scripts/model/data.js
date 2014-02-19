/* global mocha, describe, it, chai */
'use strict';
$.getScript('/app/framework/tables/js/data.js',
    function() {

        var data = window.data;
        var assert = chai.assert;

        // now load the Tea_houses object.
        $.ajax({
            url: 'test_data/Tea_houses_data.json',
            success: function(dataObj) {
                data.setBackingObject(dataObj);
            },
            async:false
        });

        describe('data', function() {

            describe('getColumnData', function() {
                
                it('#elementPath is array throws', function() {
                    console.log('this is a test!');
                    assert.throws(function() {
                        data.getColumnData([]);
                    },
                    'getColumnData()--elementPath not a string');
                });

                it('#too many arguments throws', function() {
                    assert.throws(function() {
                        data.getColumnData('fakePath', 'extra');
                    },
                    'getColumnData()--incorrect number of arguments');
                });

                var houseIdColumnStr = data.getColumnData('House_id');
                var houseIdColumn = JSON.parse(houseIdColumnStr);

                it('#returns string for House_id', function() {
                    assert.isString(houseIdColumnStr);
                });

                it('#is parseable to array for House_id', function() {
                    assert.isArray(houseIdColumn);
                });

                it('#contains first value', function() {
                    // Contains the first id in the csv
                    var result = houseIdColumn[0];
                    assert.equal(
                        result,
                        't3',
                        'did not match: ' + result);
                });

                it('#fake column returns undefined', function() {
                    var result = data.getColumnData('fakeColumn');
                    assert.isUndefined(
                        result,
                        'was not undefined: ' + result);
                });


            });

            describe('getRowId', function() {
                
                it('#index is string throws', function() {
                    assert.throws(function() {
                        data.getRowId('indexStr');
                    },
                    'getRowId()--index not an integer');
                });

                it('#too many arguments throws', function() {
                    assert.throws(function() {
                        data.getRowId(0, 'extra');
                    },
                    'getRowId()--incorrect number of arguments');
                });

                it('#returns string', function() {
                    var rowId = data.getRowId(0);
                    assert.isString(
                        rowId,
                        'was not string: ' + rowId);
                });

            });

            describe('getColumns', function() {

                var columnsStr = data.getColumns();
                var columns = JSON.parse(columnsStr);

                it('#returns string', function() {
                    assert.isString(columnsStr);
                });

                it('#string is parseable to object', function() {
                    assert.isObject(columns);
                });

                it('#WiFi is property', function() {
                    assert.property(columns, 'WiFi');
                });

                it('#WiFi is None', function() {
                    assert.equal('None', columns.WiFi);
                });

                it('#Customers is type Integer', function() {
                    var type = columns.Customers;
                    assert.equal(
                        type,
                        'Integer',
                        'was not Integer: ' + type);
                });


            });

            describe('getForegroundColor', function() {

                // At the moment we aren't actually returning any test
                // information in the debug objects, so let's just
                // verify that it is a function.
                it('#is function', function() {
                    assert.isFunction(data.getForegroundColor);
                });

                it('#returns string', function() {
                    var str = data.getForegroundColor('path', 'value');
                    assert.isString(str);
                });

                it('#three arguments throws', function() {
                    assert.throws(function() {
                        data.getForegroundColor(
                            'path',
                            'value',
                            'extra');
                    },
                    'getForegroundColor()--' +
                    'incorrect number of arguments');
                });

                it('#elementPath is array throws', function() {
                    assert.throws(function() {
                        data.getForegroundColor([], 'value');
                    },
                    'getForegroundColor()--' +
                    'elementPath must be string');
                });

                it('#value is array throws', function() {
                    assert.throws(function() {
                        data.getForegroundColor('path', []);
                    },
                    'getForegroundColor()--value must be string or number');
                });

            });

            describe('isGroupedBy', function() {

                it('#is function', function() {
                    assert.isFunction(data.isGroupedBy);
                });

                it('#Tea_houses not grouped by', function() {
                    assert.isFalse(data.isGroupedBy());
                });

            });

            describe('getData', function() {

                it('#is function', function() {
                    assert.isFunction(data.getData);
                });

                it('#row 4 House_id', function() {
                    var result = data.getData(4, 'House_id');
                    assert.equal(
                        result,
                        't6',
                        'did not match: ' + result);
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

                it('#is function', function() {
                    assert.isFunction(data.get);
                });

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
                    assert.equal(
                        result,
                        '1907',
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
